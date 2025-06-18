import { NextResponse } from "next/server";
import ServiceMan from "@/models/ServiceMan";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/serviceman/by-provider?id=PROVIDER_ID
export async function GET(req: Request) {
  await connectToDatabase();

const url = new URL(req.url);
const pathSegments = url.pathname.split('/');
const providerId = pathSegments[pathSegments.length - 1];

  if (!providerId) {
    return NextResponse.json(
      { success: false, message: "Missing providerId in query" },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const serviceMen = await ServiceMan.find({ provider: providerId });

    return NextResponse.json(
      { success: true, data: serviceMen },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching service men:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching service men" },
      { status: 500, headers: corsHeaders }
    );
  }
}
