// app/api/wallet/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import ProviderWallet from "@/models/ProviderWallet";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ✅ GET: Fetch provider wallets
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const wallets = await ProviderWallet.find();

    if (!wallets || wallets.length === 0) {
      return NextResponse.json(
        { success: false, message: "No provider wallets found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: wallets },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching provider wallets:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
