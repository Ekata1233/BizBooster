import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/utils/db";
import Provider from "@/models/Provider";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// PATCH - Append new gallery images
// PATCH - Append new gallery images with 25 image limit
export async function PATCH(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").at(-2); // Get [id] from /provider/[id]/gallery

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid provider ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("galleryImages") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files uploaded." },
        { status: 400, headers: corsHeaders }
      );
    }

    const provider = await Provider.findById(id).select("galleryImages");
    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Provider not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    const existingCount = provider.galleryImages?.length || 0;
    const totalAfterUpload = existingCount + files.length;

    if (totalAfterUpload > 25) {
      return NextResponse.json(
        {
          success: false,
          message: `Upload limit exceeded. You can only add ${25 - existingCount} more image(s).`,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `gallery_${uuidv4()}`;

      const uploadRes = await imagekit.upload({
        file: buffer,
        fileName,
        folder: "/providers/gallery",
      });

      uploadedUrls.push(uploadRes.url);
    }

    const updated = await Provider.findByIdAndUpdate(
      id,
      { $push: { galleryImages: { $each: uploadedUrls } } },
      { new: true }
    );

    return NextResponse.json(
      { success: true, data: updated.galleryImages },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("PATCH /provider/[id]/gallery error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}


// GET - Fetch all gallery images
export async function GET(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").at(-2); // Get [id] from /provider/[id]/gallery

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid provider ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const provider = await Provider.findById(id).select("galleryImages");

    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Provider not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, galleryImages: provider.galleryImages },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("GET /provider/[id]/gallery error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
