import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from "@/utils/db";
import Webinars from '@/models/Webinars'; // Adjust path as needed
import imagekit from "@/utils/imagekit"; // Assuming you have imagekit setup
import { v4 as uuidv4 } from 'uuid'; // For unique file names

// Assuming corsHeaders are defined somewhere accessible, e.g., in a separate file or directly here
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Initialize ImageKit (ensure your environment variables are set)


export async function PUT(req: NextRequest) {
  await connectToDatabase();

  try {
    // Extract ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing webinar ID in URL." },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await req.formData();

    const videoIndexStr = formData.get("videoIndex") as string | null;
    const videoName = formData.get("videoName") as string;
    const videoDescription = formData.get("videoDescription") as string;
    const videoUrl = formData.get("videoUrl") as string;
    const videoImageFile = formData.get("videoImageFile") as File | null;
    const currentVideoImageUrl = formData.get("currentVideoImageUrl") as string | null;

    if (videoIndexStr === null) {
      return NextResponse.json(
        { success: false, message: "videoIndex is required for this update." },
        { status: 400, headers: corsHeaders }
      );
    }

    const videoIndex = parseInt(videoIndexStr, 10);
    if (isNaN(videoIndex) || videoIndex < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid video index." },
        { status: 400, headers: corsHeaders }
      );
    }

    const webinarToUpdate = await Webinars.findById(id);
    if (!webinarToUpdate) {
      return NextResponse.json(
        { success: false, message: "Webinar not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    if (videoIndex >= webinarToUpdate.video.length) {
      return NextResponse.json(
        { success: false, message: "Video index out of bounds." },
        { status: 400, headers: corsHeaders }
      );
    }

    const targetVideo = webinarToUpdate.video[videoIndex];
    if (videoName !== null) targetVideo.videoName = videoName;
    if (videoDescription !== null) targetVideo.videoDescription = videoDescription;
    if (videoUrl !== null) targetVideo.videoUrl = videoUrl;

    if (videoImageFile && videoImageFile.size > 0) {
      const buffer = Buffer.from(await videoImageFile.arrayBuffer());
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${videoImageFile.name}`,
        folder: "/webinars/video_thumbnails",
      });
      targetVideo.videoImageUrl = uploadResponse.url;
    } else if (currentVideoImageUrl !== null && currentVideoImageUrl !== "null") {
      targetVideo.videoImageUrl = currentVideoImageUrl;
    } else {
      targetVideo.videoImageUrl = "";
    }

//     await webinarToUpdate.save();

    return NextResponse.json(webinarToUpdate, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: unknown) {
    console.error("PUT /api/academy/webinar-tutorials/[id] error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "Duplicate key error." },
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
        { success: false, message: `Validation Error: ${messages.join(", ")}` },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, message: (error as Error).message || "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}