import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { Ad } from "@/models/Ad";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";
import "@/models/Category"
import "@/models/Service"
import "@/models/Provider"
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET() {
  await connectToDatabase();

  try {
    // Expire all ads whose endDate has passed (date + time check)
    await Ad.updateMany(
      { endDate: { $lte: new Date() }, isExpired: false },
      { $set: { isExpired: true } }
    );

    // Fetch updated ads with relations
    const ads = await Ad.find().populate("category service provider");

    return NextResponse.json(
      { success: true, data: ads },
      { headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

