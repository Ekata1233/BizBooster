import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { Ad } from "@/models/Ad";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ APPROVE AD
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

    const updatedAd = await Ad.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    if (!updatedAd) {
      return NextResponse.json(
        { success: false, message: "Ad not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedAd },
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
