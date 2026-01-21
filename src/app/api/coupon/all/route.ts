import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Coupon from "@/models/Coupon";
import "@/models/Category";
import "@/models/Service";
import "@/models/Zone";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const active = searchParams.get("active"); 

    // First, deactivate expired coupons
    await Coupon.updateMany(
      { endDate: { $lt: new Date() }, isActive: true },
      { $set: { isActive: false } }
    );

    // Build filter object
    const filter: Record<string, unknown> = {};

    if (search) {
      const regex = { $regex: search, $options: "i" };
      filter.$or = [{ couponCode: regex }, { discountTitle: regex }];
    }

    if (active === "true") {
      const now = new Date();
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
      filter.isActive = true;
    } else if (active === "false") {
      filter.$or = [
        { isActive: false },
        { endDate: { $lt: new Date() } },
      ];
    }

    // Fetch coupons with proper population
    const coupons = await Coupon.find(filter)
      .populate("category", "name")      // category id + name
      .populate("service", "serviceName")// service id + serviceName
      .populate("zone", "name")          // zone id + name
      .sort({ createdAt: -1 });          // sort by latest

    return NextResponse.json(
      { success: true, data: coupons },
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
