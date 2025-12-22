import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import WhyJustOurService from "@/models/WhyJustOurService";

/* ─────────────── CORS ─────────────── */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

/* ─────────────── CREATE (POST) ─────────────── */

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Title and description are required." },
        { status: 400, headers: corsHeaders }
      );
    }

    let iconUrl = "";
    const iconFile = formData.get("icon") as File;

    if (iconFile) {
      const buffer = Buffer.from(await iconFile.arrayBuffer());

      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${iconFile.name}`,
        folder: "/whyjustourservice",
      });

      iconUrl = uploadResponse.url;
    }

    const service = await WhyJustOurService.create({
      title,
      description,
      icon: iconUrl,
    });

    return NextResponse.json(
      { success: true, data: service },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400, headers: corsHeaders }
    );
  }
}

/* ─────────────── GET ALL ─────────────── */

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const services = await WhyJustOurService.find({ isDeleted: false }).sort({
      createdAt: -1,
    });

    return NextResponse.json(
      { success: true, data: services },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
