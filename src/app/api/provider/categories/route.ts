import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Provider from "@/models/Provider";
import Service from "@/models/Service";
import Category from "@/models/Category";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get("providerId");

    if (!providerId || !mongoose.Types.ObjectId.isValid(providerId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing providerId" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1️⃣ Get provider with subscribed services
    const provider = await Provider.findById(providerId)
      .select("subscribedServices")
      .lean();

    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Provider not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 2️⃣ Get unique category IDs from subscribed services
    const services = await Service.find({
      _id: { $in: provider.subscribedServices },
    })
      .select("category")
      .lean();

    const categoryIds = [
      ...new Set(
        services
          .map((svc) => svc.category?.toString())
          .filter(Boolean)
      ),
    ];

    // 3️⃣ Fetch category details
    const categories = await Category.find({
      _id: { $in: categoryIds },
      isDeleted: false,
    })
      .select("_id name")
      .sort({ sortOrder: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: categories,
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
