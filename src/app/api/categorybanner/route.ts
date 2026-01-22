import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import CategoryBanner from "@/models/CategoryBanner";
import "@/models/Module";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

/* ================= CREATE ================= */
export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    const module = formData.get("module") as string;
    const file = formData.get("image") as File;

    if (!module || !file) {
      return NextResponse.json(
        { success: false, message: "Module and image are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const upload = await imagekit.upload({
      file: buffer,
      fileName: `${uuidv4()}-${file.name}`,
      folder: "/categorybanner",
    });

    const banner = await CategoryBanner.create({
      module,
      image: upload.url,
    });

    return NextResponse.json(
      { success: true, data: banner },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

/* ================= GET (ALL OR BY MODULE) ================= */
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");

    // ✅ Build filter conditionally
    const filter: any = {};
    if (moduleId) {
      filter.module = moduleId;
    }

    const banners = await CategoryBanner.find(filter)
      .populate("module", "name image")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: banners },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
