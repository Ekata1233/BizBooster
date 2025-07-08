import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import UnderStandingFetchTrue from '@/models/UnderstandingFetchTrue';
import path from 'path';
import imagekit from "@/utils/imagekit";
import fs from 'fs/promises';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function PUT(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const videoIndex = parseInt(url.searchParams.get("videoIndex") || "");

    if (!id || isNaN(videoIndex)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID or videoIndex." },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await req.formData();
    const fullName = formData.get("fullName") as string | null;
    const videoFile = formData.get("videoUrl") as File | null;

    const doc = await UnderStandingFetchTrue.findById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Entry not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    // Update name only if provided
    if (fullName && fullName.trim() !== "") {
      doc.fullName = fullName;
    }

    // Replace video only if provided
    if (videoFile instanceof File && videoFile.size > 0) {
      const buffer = Buffer.from(await videoFile.arrayBuffer());

      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${Date.now()}-${videoFile.name}`,
        folder: "/webinars/videos",
      });

      doc.videoUrl[videoIndex] = {
        fileName: videoFile.name,
        filePath: uploadResponse.url,
      };
    }

    const updated = await doc.save();

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}


export async function DELETE(req: NextRequest) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); // Get the id from URL path
  const idx = Number(url.searchParams.get("videoIndex"));

  if (!id || Number.isNaN(idx)) {
    return NextResponse.json(
      { success: false, message: "Valid ID and videoIndex query param required" },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const doc = await UnderStandingFetchTrue.findById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Entry not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    if (!doc.videoUrl || !doc.videoUrl[idx]) {
      return NextResponse.json(
        { success: false, message: "videoIndex out of range" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Optional: remove local file
    const filePath = doc.videoUrl[idx].filePath;
    const fullPath = path.join(process.cwd(), "public", filePath);

    try {
      await fs.rm(fullPath);
    } catch (e: unknown) {
      console.warn("Could not delete local file:", filePath);
    }

    // Remove the video
    doc.videoUrl.splice(idx, 1);
    await doc.save();

    return NextResponse.json(
      { success: true, message: "Video deleted", data: doc },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to delete video" },
      { status: 500, headers: corsHeaders }
    );
  }
}
