import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";
import Webinars from "@/models/Webinars";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ValidationErrorItem {
  message: string;
}

interface MongooseValidationError {
  name: string;
  errors: Record<string, ValidationErrorItem>;
}

export async function PUT(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    if (!id) {
  return NextResponse.json(
    { success: false, message: "Missing or invalid ID in URL." },
    { status: 400, headers: corsHeaders }
  );
}

    const formData = await req.formData();
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const imageFile = formData.get("imageUrl") as File | null;

    const videoFiles = formData.getAll("videos");
    const videoNames = formData.getAll("videoNames") as string[];
    const videoDescriptions = formData.getAll("videoDescriptions") as string[];

    const existingWebinar = await Webinars.findById(id);
    if (!existingWebinar) {
      return NextResponse.json(
        { success: false, message: "Webinar not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    if (name !== null) existingWebinar.name = name;
    if (description !== null) existingWebinar.description = description;

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${imageFile.name}`,
        folder: "/certifications/images",
      });

      existingWebinar.imageUrl = uploadResponse.url;
    }

    const hasNewVideos = videoFiles.length > 0;
    const hasMetadataOnly =
      videoFiles.length === 0 &&
      videoNames.length === existingWebinar.video.length &&
      videoDescriptions.length === existingWebinar.video.length;

    if (hasMetadataOnly) {
      for (let i = 0; i < existingWebinar.video.length; i++) {
        existingWebinar.video[i].videoName = videoNames[i];
        existingWebinar.video[i].videoDescription = videoDescriptions[i];
      }
    } else if (hasNewVideos) {
      if (
        videoFiles.length !== videoNames.length ||
        videoFiles.length !== videoDescriptions.length
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Mismatch in video files, names, or descriptions.",
          },
          { status: 400, headers: corsHeaders }
        );
      }

      for (let i = 0; i < videoFiles.length; i++) {
        const file = videoFiles[i] as File;
        const vname = videoNames[i] || "Untitled";
        const vdesc = videoDescriptions[i] || "No description";

        if (file instanceof File && file.size > 0) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${file.name}`,
            folder: "/certifications/videos",
          });

          existingWebinar.video.push({
            videoName: vname,
            videoDescription: vdesc,
            videoUrl: uploadResponse.url,
          });
        }
      }
    }

    const updated = await existingWebinar.save();

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("PUT /api/certifications/[id] error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A certification with this name already exists.",
        },
        { status: 409, headers: corsHeaders }
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as MongooseValidationError).name === "ValidationError"
    ) {
      const validationError = error as MongooseValidationError;
      const messages = Object.values(validationError.errors).map(
        (err) => err.message
      );
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
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
   
if (!id) {
  return NextResponse.json(
        { success: false, message: "Invalid Webinars ID format." },
        { status: 400, headers: corsHeaders }
      );
}
    const deletedWebinar = await Webinars.findByIdAndDelete(id);
    if (!deletedWebinar) {
      return NextResponse.json(
        { success: false, message: "Webinar not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Webinar deleted successfully.",
        data: deletedWebinar,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const certificationEntry = await Webinars.findById(id);

    if (!certificationEntry) {
      return NextResponse.json(
        { success: false, message: "Webinar not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: certificationEntry },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
