import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await req.formData();

    // Extract fields (adjust according to your schema)
    const serviceName = formData.get("serviceName") as string;
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const priceStr = formData.get("price") as string;
    const serviceDetailsStr = formData.get("serviceDetails") as string;
    const franchiseDetailsStr = formData.get("franchiseDetails") as string;

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

    // Parse JSON fields
    let serviceDetails = {};
    if (serviceDetailsStr) {
      try {
        serviceDetails = JSON.parse(serviceDetailsStr);
      } catch {
        return NextResponse.json(
          { success: false, message: "Invalid JSON for serviceDetails." },
          { status: 400, headers: corsHeaders }
        );
      }
    }

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

    // Handle thumbnail image upload (optional)
    let thumbnailImageUrl = "";
    const thumbnailFile = formData.get("thumbnailImage") as File | null;
    if (thumbnailFile && thumbnailFile instanceof File) {
      const arrayBuffer = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${thumbnailFile.name}`,
        folder: "/services/thumbnail",
      });

      thumbnailImageUrl = uploadResponse.url;
    }

    // Handle banner images upload (optional, multiple)
    let bannerImagesUrls: string[] = [];
    const bannerFiles = formData.getAll("bannerImages") as File[];
    for (const file of bannerFiles) {
      if (file && file instanceof File) {
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

    // Prepare update data object
    const updateData: any = {
      serviceName,
      category,
      subcategory,
      price,
      serviceDetails,
      franchiseDetails,
      isDeleted: false,
    };
    if (thumbnailImageUrl) updateData.thumbnailImage = thumbnailImageUrl;
    if (bannerImagesUrls.length > 0) updateData.bannerImages = bannerImagesUrls;

    // Update the service document
    const updatedService = await Service.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedService) {
      return NextResponse.json(
        { success: false, message: "Service not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedService },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 400, headers: corsHeaders }
    );
  }
}

export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deletedService = await Service.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedService) {
      return NextResponse.json(
        { success: false, message: "Service not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Service soft-deleted successfully" },
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
