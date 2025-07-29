import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Webinars from "@/models/Webinars";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface VideoEntry {
  videoName: string;
  videoUrl: string;
  videoDescription: string;
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const videoUrls = formData.getAll("videoUrl") as string[];
    const videoNames = formData.getAll("videoName") as string[];
    const videoDescriptions = formData.getAll("videoDescription") as string[];

    // Image handling
    const imageFile = formData.get("imageUrl") as File;
    let imageUrlString = "";

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${imageFile.name}`,
        folder: "/certifications/images",
      });
      imageUrlString = uploadResponse.url;
    } else {
      return NextResponse.json(
        { success: false, message: "Image file is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const videoToAppend: VideoEntry[] = [];

    for (let i = 0; i < videoUrls.length; i++) {
      if (!videoUrls[i] || !videoNames[i] || !videoDescriptions[i]) continue;

      videoToAppend.push({
        videoUrl: videoUrls[i],
        videoName: videoNames[i],
        videoDescription: videoDescriptions[i],
      });
    }

    // Check if webinar exists
    const existing = await Webinars.findOne({ name });

    if (existing) {
      if (description) existing.description = description;
      if (imageUrlString) existing.imageUrl = imageUrlString;
      if (videoToAppend.length > 0) {
        existing.video.push(...videoToAppend);
      }

      await existing.save();

      return NextResponse.json(existing, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Validate required fields
    if (!name || !description || !imageUrlString || videoToAppend.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, Description, Image, and at least one video are required.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const newWebinar = await Webinars.create({
      name,
      description,
      imageUrl: imageUrlString,
      video: videoToAppend,
    });

    return NextResponse.json(newWebinar, {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error: unknown) {
    console.error("POST /api/webinars error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Certification name must be unique.",
        },
        { status: 409, headers: corsHeaders }
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name: string }).name === "ValidationError" &&
      "errors" in error
    ) {
      const validationErrors = (error as { errors: Record<string, { message: string }> }).errors;
      const messages = Object.values(validationErrors).map((err) => err.message);
      return NextResponse.json(
        {
          success: false,
          message: `Validation Error: ${messages.join(", ")}`,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message || "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET All Certifications
export async function GET() {
  await connectToDatabase();

  try {
    const allWebinars = await Webinars.find({});
    return NextResponse.json(
      { success: true, data: allWebinars },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("GET /api/certifications error:", error);
    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message || "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
