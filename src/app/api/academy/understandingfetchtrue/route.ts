import { NextRequest, NextResponse } from "next/server";
// import { writeFile, mkdir } from "fs/promises";
// import path from "path";
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
    const body = await req.json();
    const { fullName, youtubeUrls } = body;

    if (!fullName || !youtubeUrls || !Array.isArray(youtubeUrls) || youtubeUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: "Full name and at least one YouTube URL are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const videosForDb = youtubeUrls.map((url: string) => ({
      fileName: 'YouTube Video', // Or extract title from URL if desired
      filePath: url, // The YouTube URL
    }));

    const newEntry = await UnderStandingFetchTrue.create({
      fullName,
      // CHANGE THIS LINE: Match your database schema's field name
      videoUrl: videosForDb, // <--- Changed from 'videos' to 'videoUrl'
    });

    return NextResponse.json({ success: true, data: newEntry }, { status: 201, headers: corsHeaders });
  } catch (error: unknown) {
    console.error("POST /api/academy/understandingfetchtrue error:", error);

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
      // Added .filter(Boolean) here to remove any null/undefined video items
      videos: (entry.videoUrl || []).filter(Boolean).map((vid: VideoItem) => ({
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
