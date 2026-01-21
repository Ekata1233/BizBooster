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
     const file = formData.get("fileUrl") as File;

   if (
      !addType ||
      !category ||
      !service ||
      !startDate ||
      !endDate ||
      !title ||
      !providerId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request. Please ensure all mandatory fields are provided.",
        },
        { status: 400, headers: corsHeaders }
      );
    }
const MAX_FILE_SIZE = 1 * 1024 * 1024;
 if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "Advertisement media is required for submission.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
  return NextResponse.json(
    {
      success: false,
      message: "File size must be less than 1MB.",
    },
    { status: 413, headers: corsHeaders }
  );
}

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to ImageKit
    const uploadRes = await imagekit.upload({
      file: buffer,
      fileName: `${uuidv4()}-${file.name}`,
    });
    const newAd = await Ad.create({
      addType,
      category,
      service,
      startDate,
      endDate,
      title,
      description,
      fileUrl: uploadRes.url,
      provider: providerId,
      isDeleted: false,
    });

    return NextResponse.json(
      { success: true, message: "Advertisement created successfully.", data: newAd },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to process your request at the moment. Please try again later.",
        error: message, // useful for logs / dev mode
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET() {
  await connectToDatabase();

  try {
    // Expire all ads whose endDate has passed (date + time check)
    await Ad.updateMany(
      { endDate: { $lte: new Date() }, isExpired: false },
      { $set: { isExpired: true } }
    );

    // Fetch updated ads with relations
    const ads = await Ad.find({isExpired : false,isDeleted: false, }).populate("category service provider");

    console.log("ads : ",ads);

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

