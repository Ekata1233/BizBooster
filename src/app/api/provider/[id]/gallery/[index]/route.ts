import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/utils/db";
import Provider from "@/models/Provider";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

type RouteContext = {
  params: {
    id: string;
    index: string;
  };
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET a specific image
export async function GET(req: NextRequest, context: RouteContext) {
  await connectToDatabase();

  const { id, index } = context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid provider ID" }, { status: 400, headers: corsHeaders });
  }

  const idx = parseInt(index);
  if (isNaN(idx)) {
    return NextResponse.json({ error: "Invalid index" }, { status: 400, headers: corsHeaders });
  }

  const provider = await Provider.findById(id);
  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404, headers: corsHeaders });
  }

  if (idx < 0 || idx >= provider.galleryImages.length) {
    return NextResponse.json({ error: "Index out of bounds" }, { status: 400, headers: corsHeaders });
  }

  return NextResponse.json({ image: provider.galleryImages[idx] }, { headers: corsHeaders });
}

// PATCH (replace image at index)
export async function PATCH(req: NextRequest, context: RouteContext) {
  await connectToDatabase();

  const { id, index } = context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid provider ID" }, { status: 400, headers: corsHeaders });
  }

  const idx = parseInt(index);
  if (isNaN(idx)) {
    return NextResponse.json({ error: "Invalid index" }, { status: 400, headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("newImage") as File;

    if (!file) {
      return NextResponse.json({ error: "Image file missing" }, { status: 400, headers: corsHeaders });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadRes = await imagekit.upload({
      file: buffer,
      fileName: `gallery_image_${Date.now()}`,
      folder: "/providers/gallery",
    });

    const provider = await Provider.findById(id);
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404, headers: corsHeaders });
    }

    if (idx < 0 || idx >= provider.galleryImages.length) {
      return NextResponse.json({ error: "Index out of bounds" }, { status: 400, headers: corsHeaders });
    }

    provider.galleryImages[idx] = uploadRes.url;
    await provider.save();

    return NextResponse.json({ success: true, updatedImages: provider.galleryImages }, { headers: corsHeaders });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}

// DELETE a specific image
export async function DELETE(req: NextRequest, context: RouteContext) {
  await connectToDatabase();

  const { id, index } = context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid provider ID" }, { status: 400, headers: corsHeaders });
  }

  const idx = parseInt(index);
  if (isNaN(idx)) {
    return NextResponse.json({ error: "Invalid index" }, { status: 400, headers: corsHeaders });
  }

  const provider = await Provider.findById(id);
  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404, headers: corsHeaders });
  }

  if (idx < 0 || idx >= provider.galleryImages.length) {
    return NextResponse.json({ error: "Index out of bounds" }, { status: 400, headers: corsHeaders });
  }

  provider.galleryImages.splice(idx, 1);
  await provider.save();

  return NextResponse.json({ success: true, updatedImages: provider.galleryImages }, { headers: corsHeaders });
}
