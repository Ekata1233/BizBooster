import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Provider from "@/models/Provider";
import Service from "@/models/Service";
import "@/models/Category";
import "@/models/Subcategory";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET: Fetch subscribed services for a provider
 * Example: /api/provider/subscribed-services?providerId=123
 */

const removeEmpty = (value: any): any => {
  // ✅ keep ObjectId & Date untouched
  if (
    value instanceof mongoose.Types.ObjectId ||
    value instanceof Date
  ) {
    return value;
  }

  // remove empty string
  if (value === "") return undefined;

  // handle arrays
  if (Array.isArray(value)) {
    const cleanedArray = value
      .map(removeEmpty)
      .filter(v => v !== undefined);

    return cleanedArray.length > 0 ? cleanedArray : undefined;
  }

  // handle objects
  if (typeof value === "object" && value !== null) {
    const cleanedObject: any = {};

    for (const key in value) {
      const cleanedValue = removeEmpty(value[key]);

      if (cleanedValue !== undefined) {
        cleanedObject[key] = cleanedValue;
      }
    }

    return Object.keys(cleanedObject).length > 0 ? cleanedObject : undefined;
  }

  // keep numbers, booleans, valid strings
  return value;
};
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const providerId = url.pathname.split("/").pop();

    if (!providerId || !mongoose.Types.ObjectId.isValid(providerId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing providerId" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 🔹 Fetch provider
    const provider = await Provider.findById(providerId)
      .populate("subscribedServices")
      .lean();

    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Provider not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 🔹 Fetch services
    const services = await Service.find({
      _id: { $in: provider.subscribedServices },
    })
      .populate("category")
      // .populate("subCategory")
      .lean();

    // 🔹 Map + clean services
    const mappedServices = services
      .map((svc: any, index: number) => {
        const providerPriceEntry = svc.providerPrices?.find(
          (pp: any) => String(pp.provider?._id) === String(providerId)
        );

        const mapped = {
          srNo: index + 1,

          // include all service fields
          ...svc,

          // provider-specific overrides
          providerPrice: providerPriceEntry?.providerPrice,
          providerMRP: providerPriceEntry?.providerMRP,
          providerDiscount: providerPriceEntry?.providerDiscount,
          providerCommission: providerPriceEntry?.providerCommission,

          // computed fields
          categoryName: svc.category?.name,
          subCategoryName: svc.subCategory?.name,

          status: "Subscribed",
        };

        // ✅ remove empty values deeply
        return removeEmpty(mapped);
      })
      .filter(Boolean); // remove undefined entries if any

    return NextResponse.json(
      {
        success: true,
        data: mappedServices,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const err = error as Error;

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

