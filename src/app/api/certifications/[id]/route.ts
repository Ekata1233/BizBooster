import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Certifications from "@/models/Certifications";
import { v4 as uuidv4 } from "uuid";
import imagekit from "@/utils/imagekit";
import mongoose from "mongoose";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function PUT(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing ID in request URL." },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Certification ID" },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await req.formData();
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const imageFile = formData.get("imageUrl") as File | null;

    const videoFiles = formData.getAll("videos");
    const videoNames = formData.getAll("videoNames") as string[];
    const videoDescriptions = formData.getAll("videoDescriptions") as string[];
    const videoIndexStr = formData.get("videoIndex") as string | null;

    const existingCertification = await Certifications.findById(id);

    if (!existingCertification) {
      return NextResponse.json(
        { success: false, message: "Certification not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    if (name !== null) existingCertification.name = name;
    if (description !== null) existingCertification.description = description;

    // ✅ Update image
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${imageFile.name}`,
        folder: "/certifications/images",
      });
      existingCertification.imageUrl = uploadResponse.url;
    }

    // ✅ Case 1: Update specific video by index
    if (videoIndexStr !== null) {
      const idx = parseInt(videoIndexStr);
      if (isNaN(idx) || !existingCertification.video[idx]) {
        return NextResponse.json(
          { success: false, message: "Invalid video index" },
          { status: 400, headers: corsHeaders }
        );
      }

      if (videoNames[0]) existingCertification.video[idx].videoName = videoNames[0];
      if (videoDescriptions[0]) existingCertification.video[idx].videoDescription = videoDescriptions[0];

      const videoFile = videoFiles[0] as File | undefined;
      if (videoFile && videoFile.size > 0) {
        const buffer = Buffer.from(await videoFile.arrayBuffer());
        const uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${videoFile.name}`,
          folder: "/certifications/videos",
        });
        existingCertification.video[idx].videoUrl = uploadResponse.url;
      }

    // ✅ Case 2: Add new videos
    } else if (videoFiles.length > 0) {
      if (videoFiles.length !== videoNames.length || videoNames.length !== videoDescriptions.length) {
        return NextResponse.json(
          { success: false, message: "Mismatch in new video data" },
          { status: 400, headers: corsHeaders }
        );
      }

      for (let i = 0; i < videoFiles.length; i++) {
        const file = videoFiles[i] as File;
        if (file && file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${file.name}`,
            folder: "/certifications/videos",
          });

          existingCertification.video.push({
            videoName: videoNames[i] || "Untitled",
            videoDescription: videoDescriptions[i] || "No description",
            videoUrl: uploadResponse.url,
          });
        }
      }
    }

    const updated = await existingCertification.save();

    return NextResponse.json({ success: true, data: updated }, { status: 200, headers: corsHeaders });

  } catch (error: unknown) {
    console.error("PUT error:", error);

    const err = error as { code?: number; name?: string; errors?: Record<string, { message: string }> };

    if (err?.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Duplicate name" },
        { status: 409, headers: corsHeaders }
      );
    }

    if (err?.name === "ValidationError" && err?.errors) {
      const messages = Object.values(err.errors).map((e) => e.message);
      return NextResponse.json(
        { success: false, message: `Validation: ${messages.join(", ")}` },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing ID in request URL." },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Certifications ID format." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deletedCertification = await Certifications.findByIdAndDelete(id);
    if (!deletedCertification) {
      return NextResponse.json(
        { success: false, message: "Certification not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Certification deleted successfully.",
        data: deletedCertification,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing ID in request URL." },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const certificationEntry = await Certifications.findById(id);

    if (!certificationEntry) {
      return NextResponse.json(
        { success: false, message: "Certification not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: certificationEntry },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
