import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Certifications from "@/models/Certifications";
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

    const videoNames = formData.getAll("videoName") as string[];
    const videoDescriptions = formData.getAll("videoDescription") as string[];

    // --- Handle Image Upload ---
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
        { success: false, message: "Image file for imageUrl is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const newVideoFiles = formData.getAll("video") as File[];
    const videoToAppend: VideoEntry[] = [];

    for (const [index, file] of newVideoFiles.entries()) {
      if (file instanceof File && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${file.name}`,
          folder: "/certifications/videos",
        });

        videoToAppend.push({
          videoName: videoNames[index] || file.name || "Untitled Video",
          videoUrl: uploadResponse.url,
          videoDescription: videoDescriptions[index] || "No description",
        });
      }
    }

    const existingCertification = await Certifications.findOne({ name });

    if (existingCertification) {
      console.log("Found existing certification:", existingCertification.name);
      const updatedFields: Partial<typeof existingCertification> = {};

      if (description) updatedFields.description = description;
      if (videoToAppend.length > 0) {
        existingCertification.video.push(...videoToAppend);
      }

      Object.assign(existingCertification, updatedFields);
      await existingCertification.save();

      return NextResponse.json(existingCertification, {
        status: 200,
        headers: corsHeaders,
      });
    } else {
      if (!name || !description || !imageUrlString) {
        return NextResponse.json(
          {
            success: false,
            message: "Name, Description, and Image are required for new certification",
          },
          { status: 400, headers: corsHeaders }
        );
      }

      if (!videoNames.length || !videoDescriptions.length || videoToAppend.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Video name, description, and at least one file are required",
          },
          { status: 400, headers: corsHeaders }
        );
      }

      const newCertification = await Certifications.create({
        name,
        imageUrl: imageUrlString,
        description,
        video: videoToAppend,
      });

      return NextResponse.json(newCertification, {
        status: 201,
        headers: corsHeaders,
      });
    }
  } catch (error: unknown) {
    console.error("POST /api/certifications error:", error);

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

// GET ALL Certifications
export async function GET() {
  await connectToDatabase();
  try {
    const certificationEntry = await Certifications.find({});

    if (!certificationEntry) {
      return NextResponse.json(
        { success: false, message: "Certification not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: certificationEntry },
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
