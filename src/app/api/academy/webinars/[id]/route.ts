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


export async function PUT(req: NextRequest) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { success: false, message: "ID parameter is missing from the URL." },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const formData = await req.formData();
    const videoIndexStr = formData.get("videoIndex") as string | null;

    const webinarToUpdate = await Webinars.findById(id);

    if (!webinarToUpdate) {
      return NextResponse.json(
        { success: false, message: "Webinar not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    if (videoIndexStr !== null) {
      const videoIndex = parseInt(videoIndexStr, 10);

      if (
        isNaN(videoIndex) ||
        videoIndex < 0 ||
        videoIndex >= webinarToUpdate.video.length
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid video index provided for update." },
          { status: 400, headers: corsHeaders }
        );
      }

      const targetVideo = webinarToUpdate.video[videoIndex];

      const videoName = formData.get("videoName") as string;
      const videoDescription = formData.get("videoDescription") as string;
      const videoUrl = formData.get("videoUrl") as string;
      const videoImageFile = formData.get("videoImageFile") as File | null;
      const currentVideoImageUrl = formData.get("currentVideoImageUrl") as string | null;

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

      return NextResponse.json(webinarToUpdate, {
        status: 200,
        headers: corsHeaders,
      });
    } else {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const mainImageFile = formData.get("imageUrl") as File | null;
      const currentMainImageUrl = formData.get("currentImageUrl") as string | null;

      if (name !== null) webinarToUpdate.name = name;
      if (description !== null) webinarToUpdate.description = description;

      if (mainImageFile && mainImageFile.size > 0) {
        const buffer = Buffer.from(await mainImageFile.arrayBuffer());
        const uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${mainImageFile.name}`,
          folder: "/webinars/main_images",
        });
        webinarToUpdate.imageUrl = uploadResponse.url;
      } else if (currentMainImageUrl !== null && currentMainImageUrl !== "null") {
        webinarToUpdate.imageUrl = currentMainImageUrl;
      } else if (!webinarToUpdate.imageUrl) {
        return NextResponse.json(
          { success: false, message: "Main image is required for the webinars." },
          { status: 400, headers: corsHeaders }
        );
      }

      const newVideos: Array<{
        videoName: string;
        videoDescription: string;
        videoUrl: string;
        videoImageUrl?: string;
      }> = [];

      let i = 0;
      while (
        formData.has(`newVideos[${i}][videoName]`) ||
        formData.has(`newVideos[${i}][videoDescription]`) ||
        formData.has(`newVideos[${i}][videoUrl]`) ||
        formData.has(`newVideos[${i}][videoImageUrl]`)
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

        if (!videoUrl || !videoName || !videoDescription) {
          if (videoUrl || videoName || videoDescription || videoImageFile) {
            return NextResponse.json(
              {
                success: false,
                message: `All video fields (URL, name, description) are required for new video entry ${i + 1}.`,
              },
              { status: 400, headers: corsHeaders }
            );
          }
        } else {
          newVideos.push({
            videoName,
            videoDescription,
            videoUrl,
            ...(videoImageUrl && { videoImageUrl }),
          });
        }

        i++;
      }

      webinarToUpdate.video.push(...newVideos);

      if (webinarToUpdate.video.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "At least one video entry (existing or new) is required for the certification.",
          },
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
    console.error("PUT /api/webinars/[id] error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "Webinar name must be unique." },
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
      const validationErrors = (error as {
        errors: Record<string, { message: string }>;
      }).errors;
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

