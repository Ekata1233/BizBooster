
import { NextResponse } from "next/server";
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


export async function GET() {
  try {
    await connectToDatabase()
    const bankDetails = await ProviderBankDetails.find()
    return NextResponse.json({ data: bankDetails }, { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error("Error fetching bankDetails:", error)
    return NextResponse.json({ message: "Server Error" }, { status: 500, headers: corsHeaders })
  }
}