// app/api/wallet/send/route.ts
import { NextResponse } from "next/server";
import ProviderWallet from "@/models/ProviderWallet";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const providerId = url.pathname.split("/").pop();

    if (!providerId) {
      return NextResponse.json(
        { success: false, message: "Missing providerId" },
        { status: 400, headers: corsHeaders }
      );
    }

    const wallet = await ProviderWallet.findOne({ providerId });

    if (!wallet) {
      return NextResponse.json(
        { success: false, message: "Provider wallet not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: wallet },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching provider wallet:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}