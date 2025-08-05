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





export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  const { id } = params; // This `id` is the ID of the Certifications document

  try {
    // Extract videoIndex from the URL's query parameters
    const { searchParams } = new URL(req.url);
    const videoIndexStr = searchParams.get("videoIndex");

    if (videoIndexStr === null) {
      return NextResponse.json(
        { success: false, message: "videoIndex is required for deleting a video." },
        { status: 400, headers: corsHeaders }
      );
    }

    const videoIndex = parseInt(videoIndexStr, 10);

    if (isNaN(videoIndex) || videoIndex < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid video index provided." },
        { status: 400, headers: corsHeaders }
      );
    }

    const certification = await Webinars.findById(id);

    if (!certification) {
      return NextResponse.json(
        { success: false, message: "Certification not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if the video index is within the bounds of the array
    if (videoIndex >= certification.video.length) {
      return NextResponse.json(
        { success: false, message: "Video index out of bounds." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Remove the video at the specified index
    // Using splice to remove the item from the array
    const [deletedVideo] = certification.video.splice(videoIndex, 1);


    await certification.save(); // Save the document with the video removed

    return NextResponse.json(
      { success: true, message: "Video deleted successfully.", deletedVideo },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("DELETE /api/academy/tutorials/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message || "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}




export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  const { id } = params; // This `id` is the ID of the Webinar document

  try {
    // Extract videoIndex from the URL's query parameters
    const { searchParams } = new URL(req.url);
    const videoIndexStr = searchParams.get("videoIndex");

    if (videoIndexStr !== null) {
      // If videoIndex is provided, try to return a specific video
      const videoIndex = parseInt(videoIndexStr, 10);

      if (isNaN(videoIndex) || videoIndex < 0) {
        return NextResponse.json(
          { success: false, message: "Invalid video index provided." },
          { status: 400, headers: corsHeaders }
        );
      }

      const webinar = await Webinars.findById(id);

      if (!webinar) {
        return NextResponse.json(
          { success: false, message: "Webinar not found." },
          { status: 404, headers: corsHeaders }
        );
      }

      if (videoIndex >= webinar.video.length) {
        return NextResponse.json(
          { success: false, message: "Video index out of bounds for the specified webinar." },
          { status: 404, headers: corsHeaders }
        );
      }

      const specificVideo = webinar.video[videoIndex];

      return NextResponse.json(
        { success: true, video: specificVideo },
        { status: 200, headers: corsHeaders }
      );

    } else {
      // If no videoIndex, return the entire webinar document
      const webinar = await Webinars.findById(id);

      if (!webinar) {
        return NextResponse.json(
          { success: false, message: "Webinar not found." },
          { status: 404, headers: corsHeaders }
        );
      }

      return NextResponse.json(
        { success: true, webinar },
        { status: 200, headers: corsHeaders }
      );
    }
  } catch (error: unknown) {
    console.error("GET /api/academy/webinars/[id] error:", error);
    // Mongoose CastError for invalid ID format
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name: string }).name === "CastError"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid Webinar ID format." },
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