import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import UnderStandingFetchTrue from "@/models/UnderstandingFetchTrue";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// PUT — update entry by ID
export async function PUT(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID in URL." },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await req.formData();

    const fullName = formData.get("fullName") as string | null;
    const description = formData.get("description") as string | null;
    const videoUrl = formData.get("videoUrl") as string | null;
    const imageFile = formData.get("imageFile") as File | null;

    const doc = await UnderStandingFetchTrue.findById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Entry not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    if (fullName && fullName.trim()) {
      doc.fullName = fullName.trim();
    }
    if (description && description.trim()) {
      doc.description = description.trim();
    }
    if (videoUrl && videoUrl.trim()) {
      doc.videoUrl = videoUrl.trim();
    }

    if (imageFile && imageFile.size > 0) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadResponse = await imagekit.upload({
        file: imageBuffer,
        fileName: `${uuidv4()}-${imageFile.name}`,
        folder: "/understandingfetchtrue/images",
      });
      doc.imageUrl = uploadResponse.url;
    }

    const updated = await doc.save();

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE — remove entry by ID
export async function DELETE(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID in URL." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deleted = await UnderStandingFetchTrue.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Entry not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Entry deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    console.error("DELETE error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to delete entry" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET — fetch entry by ID
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing entry ID in URL." },
        { status: 400, headers: corsHeaders }
      );
    }

    const entry = await UnderStandingFetchTrue.findById(id);

    if (!entry) {
      return NextResponse.json(
        { success: false, message: "Entry not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: entry },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("GET /api/academy/understandingfetchtrue/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
