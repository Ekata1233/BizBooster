// src/app/api/mentor/route.ts
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Mentor from "@/models/Mentor";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import "@/models/Service";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ GET ALL MENTORS
export async function GET() {
  await connectToDatabase();

  const mentors = await Mentor.find()
    .populate("service", "serviceName")
    .sort({ createdAt: -1 });

  return NextResponse.json(
    { success: true, data: mentors },
    { headers: corsHeaders }
  );
}

// ✅ CREATE MENTOR
export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const position = formData.get("position") as string;
    const service = formData.get("service") as string;

    if (!name || !position || !service) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    let imageUrl = "";
    const file = formData.get("image") as File;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const upload = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${file.name}`,
        folder: "/mentor",
      });

      imageUrl = upload.url;
    }

    const mentor = await Mentor.create({
      name,
      position,
      service,
      image: imageUrl,
    });

    return NextResponse.json(
      { success: true, data: mentor },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
