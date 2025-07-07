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

export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Certification ID format." },
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

    return NextResponse.json(
      { success: true, data: certification },
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

export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Certification ID format." },
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

    const existingCertification = await Webinars.findById(id);
    if (!existingCertification) {
      return NextResponse.json(
        { success: false, message: "Certification not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    if (name !== null) existingCertification.name = name;
    if (description !== null) existingCertification.description = description;

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${imageFile.name}`,
        folder: "/certifications/images",
      });

      existingCertification.imageUrl = uploadResponse.url;
    }

    const hasNewVideos = videoFiles.length > 0;
    const hasMetadataOnly =
      videoFiles.length === 0 &&
      videoNames.length === existingCertification.video.length &&
      videoDescriptions.length === existingCertification.video.length;

    if (hasMetadataOnly) {
      for (let i = 0; i < existingCertification.video.length; i++) {
        existingCertification.video[i].videoName = videoNames[i];
        existingCertification.video[i].videoDescription = videoDescriptions[i];
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

          existingCertification.video.push({
            videoName: vname,
            videoDescription: vdesc,
            videoUrl: uploadResponse.url,
          });
        }
      }
    }

    const updated = await existingCertification.save();

    return NextResponse.json(
      { success: true, data: updated },
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

export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Certification ID format." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deleted = await Webinars.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Certification not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Certification deleted successfully.",
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
