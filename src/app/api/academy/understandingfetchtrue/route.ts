// src/app/api/understandingfetchtrue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { connectToDatabase } from "@/utils/db";
import UnderStandingFetchTrue from "@/models/UnderstandingFetchTrue";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    const fullName = (formData.get("fullName") || formData.get("name")) as string;
    const videoFile = formData.get("videoUrl");

    if (!fullName || !(videoFile instanceof File))
      return NextResponse.json(
        { success: false, message: "fullName and video file are required" },
        { status: 400, headers: corsHeaders }
      );

    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });
    const filename = `${Date.now()}-${videoFile.name}`;
    await writeFile(path.join(uploadDir, filename), buffer);
    const videoUrl = `/uploads/${filename}`;

    const doc = await UnderStandingFetchTrue.create({ fullName, videoUrl });

    return NextResponse.json({ success: true, data: doc }, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET() {
  await connectToDatabase();

  try {
    const data = await UnderStandingFetchTrue.find({});
    return NextResponse.json({ success: true, data }, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
