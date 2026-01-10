import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Provider from "@/models/Provider";
import "@/models/Category";
import "@/models/Subcategory";
import "@/models/Service";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const serviceId = url.pathname.split("/").pop();

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
      return NextResponse.json(
        { success: false, message: "Invalid service ID" },
        { status: 400, headers: corsHeaders }
      );
    }

    const providers = await Provider.find({
      subscribedServices: new mongoose.Types.ObjectId(serviceId),
      isDeleted: false,
      isApproved: true,
    })
      .select(`  -password
    -resetPasswordToken
    -resetPasswordExpires
    -kyc
    -isRejected
    -isApproved
    -isVerified
    -isDeleted
    -isRecommended
    -isTrending
    -step1Completed
    -storeInfoCompleted
    -kycCompleted
    -registrationStatus`)
      .populate("storeInfo.zone", "name")
      .populate("subscribedServices", "serviceName")
      .sort({ isRecommended: -1, isTrending: -1, createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: providers.length,
        data: providers,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("GET providers by service error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
