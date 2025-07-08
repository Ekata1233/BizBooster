import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { connectToDatabase } from "@/utils/db";
import UnderStandingFetchTrue, { IUnderstandingFetchTrue, VideoItem } from '@/models/UnderstandingFetchTrue';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    const fullName = formData.get("fullName") as string;
    const videoFiles = formData.getAll("videoUrl");

    if (!fullName || !videoFiles.length)
      return NextResponse.json(
        { success: false, message: "fullName and at least one video is required" },
        { status: 400, headers: corsHeaders }
      );

    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    const uploadedVideos = [];

    for (const file of videoFiles) {
      if (!(file instanceof File)) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      uploadedVideos.push({
        fileName: file.name,
        filePath: `/uploads/${filename}`,
      });
    }

    const newEntry = await UnderStandingFetchTrue.create({
      fullName,
      videoUrl: uploadedVideos,
    });

    return NextResponse.json({ success: true, data: newEntry }, { status: 201, headers: corsHeaders });
  } catch (error: unknown) {
      console.error("GET /api/understandingfetchtrue error:", error);
  
      return NextResponse.json(
        {
          success: false,
          message: (error as Error).message || "Internal Server Error",
        },
        { status: 500, headers: corsHeaders }
      );
    }
  }




export async function GET() {
  await connectToDatabase();

  try {
    const entries: IUnderstandingFetchTrue[] = await UnderStandingFetchTrue.find({}).sort({ createdAt: -1 });

    const formattedData = entries.map((entry) => ({
      _id: entry._id,
      fullName: entry.fullName,
      videos: (entry.videoUrl || []).map((vid: VideoItem) => ({
        fileName: vid.fileName || 'Untitled',
        filePath: vid.filePath.startsWith('/')
          ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}${vid.filePath}`
          : vid.filePath,
      })),
      createdAt: entry.createdAt,
    }));

    return NextResponse.json(
      { success: true, data: formattedData },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('GET /api/academy/understandingfetchtrue error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}