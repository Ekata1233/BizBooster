import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Category from "@/models/Category";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import Banner from "@/models/Banner";

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

    const category = await Category.findById(id);

    if (!category || category.isDeleted) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: category },
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

export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const formData = await req.formData();

    const existingImages = JSON.parse(formData.get('existingImages') as string || '[]');
    const newFiles = formData.getAll('newImages') as File[];

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing banner ID.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const newUploadedUrls: string[] = [];

    for (const file of newFiles) {
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${file.name}`,
          folder: '/banners',
        });

        newUploadedUrls.push(uploadResponse.url);
      }
    }

    const finalImages = [...existingImages, ...newUploadedUrls];

    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      { images: finalImages },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { success: true, data: updatedBanner },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred';
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

    const deletedCategory = await Category.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Category soft-deleted successfully" },
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
