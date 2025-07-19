import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { connectToDatabase } from "@/utils/db";
import PartnerReview from "@/models/PartnerReview";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ PUT - Update Partner Review
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string | undefined;
    const videoUrl = formData.get("videoUrl") as string | undefined;
    const imageFile = formData.get("imageUrl") as File | null;

    interface PartnerReviewUpdateData {
      title?: string;
      videoUrl?: string;
      imageUrl?: string;
    }
    const updateData: PartnerReviewUpdateData = {};
    if (title) updateData.title = title;
    if (videoUrl) updateData.videoUrl = videoUrl;

    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    // ✅ Handle new image upload
    if (imageFile) {
      const existing = await PartnerReview.findById(id);
      if (existing?.imageUrl?.startsWith("/uploads/")) {
        const oldImagePath = path.join(process.cwd(), "public", existing.imageUrl);
        try {
          await unlink(oldImagePath);
        } catch (err) {
          console.log(`Failed to delete old image: ${oldImagePath}`, err);
          console.warn(`Failed to delete old image: ${oldImagePath}`);
        }
      }

      const imageBytes = await imageFile.arrayBuffer();
      const imageBuffer = Buffer.from(imageBytes);
      const imageFilename = `${Date.now()}-${imageFile.name}`;
      const imagePath = path.join(uploadDir, imageFilename);
      await writeFile(imagePath, imageBuffer);
      updateData.imageUrl = `/uploads/${imageFilename}`;
    }

    const updatedReview = await PartnerReview.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedReview) {
      return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedReview }, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ DELETE - Delete Partner Review
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  try {
    const id = params.id;
    const deletedReview = await PartnerReview.findByIdAndDelete(id);
    if (!deletedReview) {
      return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
    }

    // Remove image from uploads
    if (deletedReview.imageUrl?.startsWith("/uploads/")) {
      const imagePath = path.join(process.cwd(), "public", deletedReview.imageUrl);
      try {
        await unlink(imagePath);
      } catch (err) {
        console.error(`Failed to delete image: ${imagePath}`, err);
        console.warn(`Failed to delete image: ${imagePath}`);
      }
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}


// ✅ GET - Fetch a single Partner Review by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const review = await PartnerReview.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Entry not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: review },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("GET /api/partnerreview/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
