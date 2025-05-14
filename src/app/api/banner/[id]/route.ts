import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Banner from "@/models/Banner";
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

export async function GET(req: Request) {
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

    const banner = await Banner.findById(id);
    if (!banner || banner.isDeleted) {
      return NextResponse.json(
        { success: false, message: "Banner not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: banner },
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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  const formData = await req.formData();
  const existingImages = JSON.parse(formData.get('existingImages') as string);
  const newFiles = formData.getAll('newImages') as File[];

  const newUploadedUrls: string[] = [];

  for (const file of newFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const result = await imagekit.upload({
      file: `data:${file.type};base64,${base64}`,
      fileName: file.name,
      folder: 'banners',
    });

    newUploadedUrls.push(result.url);
  }

  const finalImages = [...existingImages, ...newUploadedUrls];

  await Banner.findByIdAndUpdate(params.id, {
    images: finalImages,
  });

  return NextResponse.json({ success: true, images: finalImages });
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

    const deletedBanner = await Banner.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedBanner) {
      return NextResponse.json(
        { success: false, message: "Banner not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Banner soft-deleted successfully" },
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
