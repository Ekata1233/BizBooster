import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import "@/models/Category";      // registers the Category model
import "@/models/Subcategory";
import "@/models/WhyChoose";
import "@/models/Provider";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};


export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// NO CHANGE (PRODUCTION LEVEL)
export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const subcategory = searchParams.get("subcategory");
    const sort = searchParams.get("sort");

    // Build filter
    const filter: Record<string, unknown> = { isDeleted: false };

    // Category comes from route params
    if (id) {
      filter.category = id;
    }

    if (search) {
      // Regex search for serviceName
      filter.serviceName = { $regex: `\\b${search}[a-zA-Z]*`, $options: "i" };
    }

    if (subcategory) {
      filter.subcategory = subcategory;
    }

    // Build sort option
    let sortOption: Record<string, 1 | -1> = {};

    switch (sort) {
      case "latest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "ascending":
        sortOption = { serviceName: 1 };
        break;
      case "descending":
        sortOption = { serviceName: -1 };
        break;
      case "asc":
        sortOption = { price: 1 };
        break;
      case "desc":
        sortOption = { price: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Fetch services
    const services = await Service.find(filter)
      .populate("category")
      .populate("subcategory")
      .populate("serviceDetails.whyChoose")
      .populate({
        path: "providerPrices.provider",
        model: "Provider",
        select: "fullName storeInfo.storeName storeInfo.logo",
      })
      .sort(sortOption)
      .exec();

    return NextResponse.json(
      { success: true, data: services },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}