import { NextResponse } from "next/server";
import Banner from "@/models/Banner";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";

// CORS headers for all requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Preflight request handler for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET banner by ID
export async function GET(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400, headers: corsHeaders });
  }

  const banner = await Banner.findById(id);
  if (!banner || banner.isDeleted) {
    return NextResponse.json({ success: false, message: "Banner not found" }, { status: 404, headers: corsHeaders });
  }

  return NextResponse.json({ success: true, data: banner }, { status: 200, headers: corsHeaders });
}

// UPDATE banner by ID (with image uploads)
export async function PUT(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400, headers: corsHeaders });
  }

  try {
    const formData = await req.formData();

    // Get existing images from client (JSON string)
    const existingImages = JSON.parse(formData.get("existingImages") as string || "[]") as { url: string; category: string; module: string }[];

    // New image files to upload
    const newFilesRaw = formData.getAll("newImages");
    const newFiles = newFilesRaw.filter(f => f instanceof File) as File[];

    const category = formData.get("category")?.toString() || "";
    const module = formData.get("module")?.toString() || "";
    const page = formData.get("page")?.toString();

    if (!page || !["homepage", "categorypage"].includes(page)) {
      return NextResponse.json({ success: false, message: "Invalid page" }, { status: 400, headers: corsHeaders });
    }

    // Upload new images to ImageKit
    const newUploadedImages = [];
    for (const file of newFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const upload = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${file.name}`,
        folder: "banners",
      });

      newUploadedImages.push({ url: upload.url, category, module });
    }

    // Merge existing + new images
    const finalImages = [...existingImages, ...newUploadedImages];

    if (finalImages.length === 0) {
      return NextResponse.json({ success: false, message: "At least one image is required" }, { status: 400, headers: corsHeaders });
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      { images: finalImages, page, isDeleted: false },
      { new: true, runValidators: true }
    );

    if (!updatedBanner) {
      return NextResponse.json({ success: false, message: "Banner not found or failed to update" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, data: updatedBanner }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500, headers: corsHeaders });
  }
}

// SOFT DELETE banner by ID
export async function DELETE(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400, headers: corsHeaders });
  }

  const deletedBanner = await Banner.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

  if (!deletedBanner) {
    return NextResponse.json({ success: false, message: "Banner not found" }, { status: 404, headers: corsHeaders });
  }

  return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200, headers: corsHeaders });
}
