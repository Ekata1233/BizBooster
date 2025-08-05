import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

import Webinars from "@/models/Webinars";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid webinar ID format." },
        { status: 400, headers: corsHeaders }
      );
    }

    const webinar = await Webinars.findById(id);

    if (!webinar) {
      return NextResponse.json(
        { success: false, message: "webinar not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: webinar },
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


export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  const { id } = await params;

  try {
    const formData = await req.formData();

    // Check if this request is specifically for updating an existing video by index
    const videoIndexStr = formData.get("videoIndex") as string | null;

    const webinarToUpdate = await Webinars.findById(id);

    if (!webinarToUpdate) {
      return NextResponse.json(
        { success: false, message: "webinar not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    if (videoIndexStr !== null) {
      // SCENARIO 1: Request to update an EXISTING video by its index
      const videoIndex = parseInt(videoIndexStr, 10);
      
      // Basic validation for video index
      if (isNaN(videoIndex) || videoIndex < 0 || videoIndex >= webinarToUpdate.video.length) {
        return NextResponse.json(
          { success: false, message: "Invalid video index provided for update." },
          { status: 400, headers: corsHeaders }
        );
      }

      const targetVideo = webinarToUpdate.video[videoIndex];

      // Get fields specific to a single video update (top-level formData keys)
      const videoName = formData.get("videoName") as string;
      const videoDescription = formData.get("videoDescription") as string;
      const videoUrl = formData.get("videoUrl") as string;
      const videoImageFile = formData.get("videoImageFile") as File | null;
      const currentVideoImageUrl = formData.get("currentVideoImageUrl") as string | null;

      // Update specific video fields
      if (videoName !== null) targetVideo.videoName = videoName;
      if (videoDescription !== null) targetVideo.videoDescription = videoDescription;
      if (videoUrl !== null) targetVideo.videoUrl = videoUrl;

      // Handle video thumbnail image update for the specific video
      if (videoImageFile && videoImageFile.size > 0) {
        // A new image file was uploaded for the thumbnail
        const buffer = Buffer.from(await videoImageFile.arrayBuffer());
        const uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${videoImageFile.name}`,
          folder: "/webinars/video_thumbnails", // Specific folder for video thumbnails
        });
        targetVideo.videoImageUrl = uploadResponse.url;
      } else if (currentVideoImageUrl !== null && currentVideoImageUrl !== 'null') {
        // No new file, but an existing URL was provided by the client (or null to clear it)
        targetVideo.videoImageUrl = currentVideoImageUrl;
      } else {
        // If neither new file nor current URL is present, explicitly remove the image
        targetVideo.videoImageUrl = ""; // Or `null` if your schema allows/prefers null
      }

      await webinarToUpdate.save();

      return NextResponse.json(webinarToUpdate, {
        status: 200,
        headers: corsHeaders,
      });

    } else {
      // SCENARIO 2: Request to update main webinars details AND/OR add NEW videos
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const mainImageFile = formData.get("imageUrl") as File | null; // This will be the new file if uploaded
      const currentMainImageUrl = formData.get("currentImageUrl") as string | null;

      // Update main webinars name and description
      if (name !== null) webinarToUpdate.name = name;
      if (description !== null) webinarToUpdate.description = description;

      // Handle main image update
      if (mainImageFile && mainImageFile.size > 0) {
        // New main image uploaded
        const buffer = Buffer.from(await mainImageFile.arrayBuffer());
        const uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${mainImageFile.name}`,
          folder: "/webinars/main_images",
        });
        webinarToUpdate.imageUrl = uploadResponse.url;
      } else if (currentMainImageUrl !== null && currentMainImageUrl !== 'null') {
        // Use existing URL if no new file is uploaded
        webinarToUpdate.imageUrl = currentMainImageUrl;
      } else if (!webinarToUpdate.imageUrl) {
        // If neither new file nor old URL is present and it's missing, require it
        // This check only triggers if current imageUrl is also empty, preventing accidental removal if not re-sent
        return NextResponse.json(
          { success: false, message: "Main image is required for the webinars." },
          { status: 400, headers: corsHeaders }
        );
      } else {
        // If currentMainImageUrl is null/empty and no new file, explicitly clear it
        webinarToUpdate.imageUrl = "";
      }


      const newVideos: Array<{
        videoName: string;
        videoDescription: string;
        videoUrl: string;
        videoImageUrl?: string;
      }> = [];

      let i = 0;
      // Loop through potential new video entries (e.g., from an array of inputs)
      while (
        formData.has(`newVideos[${i}][videoName]`) ||
        formData.has(`newVideos[${i}][videoDescription]`) ||
        formData.has(`newVideos[${i}][videoUrl]`) ||
        formData.has(`newVideos[${i}][videoImageUrl]`) // Check for image file too
      ) {
        const videoName = formData.get(`newVideos[${i}][videoName]`) as string;
        const videoDescription = formData.get(`newVideos[${i}][videoDescription]`) as string;
        const videoUrl = formData.get(`newVideos[${i}][videoUrl]`) as string;
        const videoImageFile = formData.get(`newVideos[${i}][videoImageUrl]`) as File | null;

        let videoImageUrl: string | undefined;

        if (videoImageFile && videoImageFile.size > 0) {
          const buffer = Buffer.from(await videoImageFile.arrayBuffer());
          const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${videoImageFile.name}`,
            folder: "/webinars/video_thumbnails",
          });
          videoImageUrl = uploadResponse.url;
        }

        // Validate new video entry: all fields must be present if any part of the entry exists
        if (!videoUrl || !videoName || !videoDescription) {
          // If some parts are missing but others are present, it's an incomplete entry
          if (videoUrl || videoName || videoDescription || videoImageFile) {
            return NextResponse.json(
              { success: false, message: `All video fields (URL, name, description) are required for new video entry ${i + 1}.` },
              { status: 400, headers: corsHeaders }
            );
          }
        } else {
          // If all required fields are present, add the new video
          newVideos.push({
            videoName,
            videoDescription,
            videoUrl,
            ...(videoImageUrl && { videoImageUrl }), // Only add videoImageUrl if it exists
          });
        }
        i++;
      }

      // Add all validated new videos to the webinar's video array
      webinarToUpdate.video.push(...newVideos);

      // Final check for minimum video entries (if your app requires at least one video)
      if (webinarToUpdate.video.length === 0) {
        return NextResponse.json(
          { success: false, message: "At least one video entry (existing or new) is required for the certification." },
          { status: 400, headers: corsHeaders }
        );
      }

      await webinarToUpdate.save();

      return NextResponse.json(webinarToUpdate, {
        status: 200,
        headers: corsHeaders,
      });
    }
  } catch (error: unknown) {
    console.error("PUT /api/Webinars/[id] error:", error);

    // Mongoose duplicate key error (e.g., if Webinar name needs to be unique)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Webinar name must be unique.",
        },
        { status: 409, headers: corsHeaders }
      );
    }

    // Mongoose validation errors
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

    // Generic internal server error
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
    const id = url.pathname.split("/").pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Webinar ID format." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deleted = await Webinars.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Webinar not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Webinar deleted successfully.",
        data: deleted,
      },
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

