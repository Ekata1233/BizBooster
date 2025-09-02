import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ProviderBankDetails from "@/models/ProviderBankDetails";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

// GET (fetch provider bank details by providerId)
export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    console.log("providerId:", id);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Valid provider ID is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const bankDetails = await ProviderBankDetails.findOne({
      providerId: new mongoose.Types.ObjectId(id),
    });

    if (!bankDetails) {
      return NextResponse.json(
        { success: false, message: "No bank details found for this provider." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: bankDetails },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error fetching bank details:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
