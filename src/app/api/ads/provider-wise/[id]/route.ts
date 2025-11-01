import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { Ad } from "@/models/Ad";
import "@/models/Category"
import "@/models/Service"
import "@/models/Provider"
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ GET SPECIFIC AD
export async function GET(req: Request) {
    await connectToDatabase();

    try {
        const url = new URL(req.url);
        const providerId = url.pathname.split("/").pop();

        console.log("provider ID : ", providerId);

       if (!providerId) {
      return NextResponse.json(
        { success: false, message: "Missing providerId parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Find ads where provider ObjectId matches
    const ads = await Ad.find({ provider: providerId })
      .populate("category service provider")
      .sort({ createdAt: -1 });

    if (!ads || ads.length === 0) {
      return NextResponse.json(
        { success: false, message: "No ads found for this provider." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: ads },
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