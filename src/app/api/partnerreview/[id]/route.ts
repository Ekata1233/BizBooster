import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import PartnerReview from "@/models/PartnerReview";
import { connectToDatabase } from "@/utils/db";

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

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid PartnerReview ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await req.formData();

    const title = formData.get("title") as string | null;
    const videoUrl = formData.get("videoUrl") as string | null;
    const imageFile = formData.get("imageUrl") as File | null;

    interface PartnerReviewUpdate {
      title?: string;
      videoUrl?: string;
      imageUrl?: string;
    }

    const updateData: PartnerReviewUpdate = {};
    if (title) updateData.title = title;
    if (videoUrl) updateData.videoUrl = videoUrl;

    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    if (imageFile && imageFile.name) {
      const existing = await PartnerReview.findById(id);
      if (existing?.imageUrl?.startsWith("/uploads/")) {
        const oldImagePath = path.join(process.cwd(), "public", existing.imageUrl);
        try {
          await unlink(oldImagePath);
        } catch (err) {
          console.warn("Failed to delete old image:", err);
        }
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const imageFilename = `${Date.now()}-${imageFile.name}`;
      const filePath = path.join(uploadDir, imageFilename);
      await writeFile(filePath, buffer);
      updateData.imageUrl = `/uploads/${imageFilename}`;
    }

    const updated = await PartnerReview.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "PartnerReview not found to update." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error updating PartnerReview.";
    console.error("PUT PartnerReview Error:", error);
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid PartnerReview ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deleted = await PartnerReview.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "PartnerReview not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    if (deleted.imageUrl?.startsWith("/uploads/")) {
      const imagePath = path.join(process.cwd(), "public", deleted.imageUrl);
      try {
        await unlink(imagePath);
      } catch (err) {
        console.warn("Failed to delete image:", err);
      }
    }

    return NextResponse.json(
      { success: true, message: "PartnerReview deleted successfully.", data: { id } },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error deleting PartnerReview.";
    console.error("DELETE PartnerReview Error:", error);
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
