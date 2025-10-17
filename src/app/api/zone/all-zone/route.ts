import { NextResponse } from "next/server";
import Zone from "@/models/Zone";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// GET /api/zones (fetch all zones including deleted)
export async function GET() {
  try {
    await connectToDatabase();
    const zones = await Zone.find(); // fetch all zones, no filter on isDeleted
    return NextResponse.json({ data: zones }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching zones:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500, headers: corsHeaders });
  }
}
