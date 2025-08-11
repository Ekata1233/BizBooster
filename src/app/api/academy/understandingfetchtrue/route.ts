import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import UnderStandingFetchTrue, { IUnderstandingFetchTrue } from "@/models/UnderstandingFetchTrue";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// POST - Create new UnderstandingFetchTrue entry
export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const fullName = formData.get("fullName") as string;
    const description = formData.get("description") as string;
    const videoUrl = formData.get("videoUrl") as string;
    const imageFile = formData.get("imageFile") as File | null;

    // --- Validation ---
    if (!fullName || !description || !videoUrl) {
      return NextResponse.json(
        { success: false, message: "Full name, description, and video URL are required." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { success: false, message: "Image file is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    // --- Upload Image to ImageKit ---
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const uploadResponse = await imagekit.upload({
      file: imageBuffer,
      fileName: `${uuidv4()}-${imageFile.name}`,
      folder: "/understandingfetchtrue/images",
    });

    const imageUrl = uploadResponse.url;

    // --- Save to DB ---
    const newEntry = await UnderStandingFetchTrue.create({
      fullName,
      description,
      videoUrl,
      imageUrl,
    });

    return NextResponse.json(
      { success: true, data: newEntry },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("POST /api/academy/understandingfetchtrue error:", error);
    return NextResponse.json(
      { success: false, message: (error as Error).message || "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET - Fetch all entries
export async function GET() {
  await connectToDatabase();

  try {
    const entries: IUnderstandingFetchTrue[] = await UnderStandingFetchTrue.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: entries },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("GET /api/academy/understandingfetchtrue error:", error);
    return NextResponse.json(
      { success: false, message: (error as Error).message || "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// OPTIONS - CORS Preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
