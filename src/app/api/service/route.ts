import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import "@/models/Category";      // registers the Category model
import "@/models/Subcategory";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    console.log("Service",formData)

    // Required fields from formData (adjust based on your schema)
    const serviceName = formData.get("serviceName") as string;
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const priceStr = formData.get("price") as string;

    if (!serviceName || !category || !subcategory || !priceStr) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400, headers: corsHeaders }
      );
    }

    const price = parseFloat(priceStr);
    if (isNaN(price)) {
      return NextResponse.json(
        { success: false, message: "Price must be a valid number." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Handle images
    let thumbnailImageUrl = "";
    const thumbnailFile = formData.get("thumbnailImage") as File;
    if (thumbnailFile) {
      const arrayBuffer = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${thumbnailFile.name}`,
        folder: "/services/thumbnail",
      });
      thumbnailImageUrl = uploadResponse.url;
    } else {
      return NextResponse.json(
        { success: false, message: "Thumbnail image is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Handle bannerImages (array of files)
    const bannerFiles = formData.getAll("bannerImages") as File[]; // getAll for multiple files
    const bannerImagesUrls: string[] = [];
    for (const file of bannerFiles) {
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${file.name}`,
          folder: "/services/banners",
        });
        bannerImagesUrls.push(uploadResponse.url);
      }
    }

    // serviceDetails - JSON string or individual fields? Assuming JSON string here:
    const serviceDetailsStr = formData.get("serviceDetails") as string;
    let serviceDetails = {};
    if (serviceDetailsStr) {
      try {
        serviceDetails = JSON.parse(serviceDetailsStr);
      } catch {
        // Ignore or return error
        return NextResponse.json(
          { success: false, message: "Invalid JSON for serviceDetails." },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // franchiseDetails - similarly, parse JSON if present
    const franchiseDetailsStr = formData.get("franchiseDetails") as string;
    let franchiseDetails = {};
    if (franchiseDetailsStr) {
      try {
        franchiseDetails = JSON.parse(franchiseDetailsStr);
      } catch {
        return NextResponse.json(
          { success: false, message: "Invalid JSON for franchiseDetails." },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    const newService = await Service.create({
      serviceName,
      category,
      subcategory,
      price,
      thumbnailImage: thumbnailImageUrl,
      bannerImages: bannerImagesUrls,
      serviceDetails,
      franchiseDetails,
      isDeleted: false,
    });

    return NextResponse.json(
      { success: true, data: newService },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 400, headers: corsHeaders }
    );
  }
}

// GET all services with optional search by serviceName
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    interface ServiceFilter {
      isDeleted: boolean;
      serviceName?: { $regex: string; $options: string };
    }
    const filter: ServiceFilter = { isDeleted: false };

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.serviceName = searchRegex;
    }

    // Populate category and subcategory references if you want
    const services = await Service.find(filter)
      .populate("category")
      .populate("subcategory");

    return NextResponse.json(
      { success: true, data: services },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
