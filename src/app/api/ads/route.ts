import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { Ad } from "@/models/Ad";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";
import "@/models/Category"
import "@/models/Service"
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    console.log("formdata : ", formData)

    const addType = formData.get("addType") as string;
    const providerId = formData.get("providerId") as string;
    const category = formData.get("category") as string;
    const service = formData.get("service") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!addType || !category || !service || !startDate || !endDate || !title || !providerId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    const fileUrl = formData.get("fileUrl") as string;

    const newAd = await Ad.create({
      addType,
      category,
      service,
      startDate,
      endDate,
      title,
      description,
      fileUrl,
      provider: providerId,
    });

    return NextResponse.json(
      { success: true, data: newAd },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET() {
  await connectToDatabase();

  try {
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    // Find all ads
    const ads = await Ad.find().populate("category service");

    // Check for expiry and update if needed
    const updatePromises = ads.map(async (ad: any) => {
      const adEndDate = new Date(ad.endDate).toISOString().split("T")[0];
      if (adEndDate === today && !ad.isExpired) {
        ad.isExpired = true;
        await ad.save();
      }
      return ad;
    });

    const updatedAds = await Promise.all(updatePromises);

    return NextResponse.json(
      { success: true, data: updatedAds },
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
