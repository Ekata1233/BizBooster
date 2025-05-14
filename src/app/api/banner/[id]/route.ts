import { NextRequest, NextResponse } from "next/server";
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
    const id = new URL(req.url).pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing ID parameter." }, { status: 400, headers: corsHeaders });
    }

    const banner = await Banner.findById(id);

    if (!banner || banner.isDeleted) {
      return NextResponse.json({ success: false, message: "Banner not found" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, data: banner }, { status: 200, headers: corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    const existingImages = JSON.parse(formData.get("existingImages") as string);
    const newFiles = formData.getAll("newImages") as File[];

    const uploadedUrls: string[] = [];

    for (const file of newFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      const result = await imagekit.upload({
        file: `data:${file.type};base64,${base64}`,
        fileName: file.name,
        folder: "banners",
      });

      uploadedUrls.push(result.url);
    }

    const finalImages = [...existingImages, ...uploadedUrls];

    const updatedBanner = await Banner.findByIdAndUpdate(params.id, { images: finalImages }, { new: true });

    return NextResponse.json({ success: true, data: updatedBanner }, { status: 200, headers: corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const id = new URL(req.url).pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing ID parameter." }, { status: 400, headers: corsHeaders });
    }

    const deletedBanner = await Banner.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    if (!deletedBanner) {
      return NextResponse.json({ success: false, message: "Banner not found" }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, message: "Banner soft-deleted successfully" }, { status: 200, headers: corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
  }
}
