import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from "@/utils/db";
// import Webinars from '@/models/Webinars'; // Adjust path as needed
import Certifications from '@/models/Certifications';
import imagekit from "@/utils/imagekit"; // Assuming you have imagekit setup
import { v4 as uuidv4 } from 'uuid'; // For unique file names
import mongoose from 'mongoose';

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
    const id = req.nextUrl.pathname.split("/").pop();

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
        { success: false, message: "Invalid video index provided for update." },
        { status: 400, headers: corsHeaders }
      );
    }

    const webinarToUpdate = await Certifications.findById(id);
    if (!webinarToUpdate) {
      return NextResponse.json(
        { success: false, message: "Webinar not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    if (videoIndex >= webinarToUpdate.video.length) {
      return NextResponse.json(
        { success: false, message: "Video index out of bounds for the specified webinar." },
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

    await webinarToUpdate.save();

    return NextResponse.json(
      { success: true, data: webinarToUpdate },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    // Mongoose duplicate key error
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A unique constraint was violated.",
        },
        { status: 409, headers: corsHeaders }
      );
    }

    // Mongoose validation error
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

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message || "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}



export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // extract ID from path
    const videoIndexStr = url.searchParams.get("videoIndex");

    // Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid tutorial ID format." },
        { status: 400, headers: corsHeaders }
      );
    }

    // If videoIndex is provided, delete the video from the array
    if (videoIndexStr !== null) {
      const videoIndex = parseInt(videoIndexStr, 10);

      if (isNaN(videoIndex) || videoIndex < 0) {
        return NextResponse.json(
          { success: false, message: "Invalid video index provided." },
          { status: 400, headers: corsHeaders }
        );
      }

      const tutorial = await Certifications.findById(id);

      if (!tutorial) {
        return NextResponse.json(
          { success: false, message: "Tutorial not found." },
          { status: 404, headers: corsHeaders }
        );
      }

      if (videoIndex >= tutorial.video.length) {
        return NextResponse.json(
          { success: false, message: "Video index out of bounds." },
          { status: 400, headers: corsHeaders }
        );
      }

      const [deletedVideo] = tutorial.video.splice(videoIndex, 1);
      await tutorial.save();

      return NextResponse.json(
        {
          success: true,
          message: "Video deleted successfully.",
          deletedVideo,
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // If no videoIndex, delete the entire tutorial
    const deletedTutorial = await Certifications.findByIdAndDelete(id);

    if (!deletedTutorial) {
      return NextResponse.json(
        { success: false, message: "Tutorial not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Tutorial deleted successfully.",
        data: deletedTutorial,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("DELETE /api/academy/tutorials/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}