import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Coupon from "@/models/Coupon";
import "@/models/Category";
import "@/models/Service";
import "@/models/Zone";
import "@/models/Provider";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};


export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}


export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await req.formData();

    console.log("formdata of the coupon for the update : ", formData);

    const updateData: Record<string, unknown> = {};

    const setIfPresent = (
      key: string,
      val: FormDataEntryValue | null,
      transform: (v: FormDataEntryValue) => unknown = (v) => v
    ) => {
      if (val !== null && val !== undefined && val !== "") {
        updateData[key] = transform(val);
      }
    };

    setIfPresent("couponType", formData.get("couponType"));
    setIfPresent(
      "couponCode",
      formData.get("couponCode"),
      (v) => String(v).trim().toUpperCase()
    );
    setIfPresent("customer", formData.get("customer"));
    setIfPresent("discountType", formData.get("discountType"));
    setIfPresent("discountTitle", formData.get("discountTitle"));
    setIfPresent("category", formData.get("category"));
    setIfPresent("service", formData.get("service"));
    setIfPresent("zone", formData.get("zone"));
    setIfPresent("discountAmountType", formData.get("discountAmountType"));
    setIfPresent("amount", formData.get("amount"), Number);
    setIfPresent("maxDiscount", formData.get("maxDiscount"), Number);
    setIfPresent("minPurchase", formData.get("minPurchase"), Number);
    setIfPresent("startDate", formData.get("startDate"), (v) => new Date(String(v)));
    setIfPresent("endDate", formData.get("endDate"), (v) => new Date(String(v)));
    setIfPresent("limitPerUser", formData.get("limitPerUser"), Number);
    setIfPresent("discountCostBearer", formData.get("discountCostBearer"));
    setIfPresent("couponAppliesTo", formData.get("couponAppliesTo"));
    setIfPresent("isActive", formData.get("isActive"), (v) => v === "true");

    // If discountAmountType is updated to "Percentage", ensure maxDiscount is provided
    if (
      updateData.discountAmountType === "Percentage" &&
      (updateData.maxDiscount === undefined ||
        isNaN(updateData.maxDiscount as number))
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "maxDiscount is required when discountAmountType is 'Percentage'.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // 🔹 Automatically handle expiration via isActive
    if (updateData.endDate) {
      const today = new Date();
      const endDate = new Date(updateData.endDate as Date);
      if (endDate <= today) {
        updateData.isActive = false; // Coupon expired
      } else {
        updateData.isActive = true; // Coupon re-activated
      }
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCoupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedCoupon },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 400, headers: corsHeaders }
    );
  }
}


export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deletedCoupon = await Coupon.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedCoupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Coupon soft-deleted successfully." },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const coupon = await Coupon.findById(id)
      .populate("category")
      .populate("service")
      .populate("zone")
      // .populate("provider");

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: coupon },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}