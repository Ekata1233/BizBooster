import { NextResponse } from "next/server";
import Banner from "@/models/Banner";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";

// Enable CORS for all methods
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET a specific banner by ID
export async function GET(req: Request) {
  await connectToDatabase();

  const id = req.url.split("/").pop();
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing ID" },
      { status: 400, headers: corsHeaders }
    );
  }

  const banner = await Banner.findById(id);
  if (!banner || banner.isDeleted) {
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json({ success: true, data: banner }, { status: 200, headers: corsHeaders });
}

// UPDATE a specific banner by ID
export async function PUT(req: Request) {
  await connectToDatabase();

  const id = req.url.split("/").pop();
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing ID" },
      { status: 400, headers: corsHeaders }
    );
  }

  const formData = await req.formData();
  const existingImages = JSON.parse(formData.get("existingImages") as string || "[]") as { url: string; category: string; module: string }[];
  const newFiles = formData.getAll("newImages") as File[];
  const category = formData.get("category")?.toString();
  const module = formData.get("module")?.toString();

  const newUploadedImages: { url: string; category: string; module: string }[] = [];

  for (const file of newFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const upload = await imagekit.upload({
      file: buffer,
      fileName: `${uuidv4()}-${file.name}`,
      folder: "/banners",
    });

    newUploadedImages.push({ url: upload.url, category: category || "", module: module || "" });
  }

  const finalImages = [...existingImages, ...newUploadedImages];

  const updatedBanner = await Banner.findByIdAndUpdate(
    id,
    { images: finalImages, page: formData.get("page")?.toString(), isDeleted: false },
    { new: true, runValidators: true }
  );

  if (!updatedBanner) {
    return NextResponse.json(
      { success: false, message: "Banner not found or failed to update" },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json({ success: true, data: updatedBanner }, { status: 200, headers: corsHeaders });
}


// DELETE (soft delete) a specific banner by ID
export async function DELETE(req: Request) {
  await connectToDatabase();

  const id = req.url.split("/").pop();
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing ID" },
      { status: 400, headers: corsHeaders }
    );
  }

  const deletedBanner = await Banner.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

  if (!deletedBanner) {
    return NextResponse.json(
      { success: false, message: "Banner not found" },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    { success: true, message: "Deleted successfully" },
    { status: 200, headers: corsHeaders }
  );
}
