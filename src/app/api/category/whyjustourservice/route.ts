import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import WhyJustOurService from "@/models/WhyJustOurService";
import "@/models/Module";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

// CREATE
export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    const moduleId = formData.get("module") as string;

    if (!moduleId) {
      return NextResponse.json(
        { success: false, message: "Module is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    // 🔹 Collect multiple items
    const items: any[] = [];
    let index = 0;

    while (formData.get(`items[${index}][title]`)) {
      const title = formData.get(`items[${index}][title]`) as string;
      const description = formData.get(`items[${index}][description]`) as string;
      const iconFile = formData.get(`items[${index}][icon]`) as File | null;
      const list = formData.get(`items[${index}][list]`) as string | null;

      if (!title || !description || !iconFile) {
        return NextResponse.json(
          { success: false, message: "Each item must have title, description and icon." },
          { status: 400, headers: corsHeaders }
        );
      }

      const buffer = Buffer.from(await iconFile.arrayBuffer());
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${iconFile.name}`,
        folder: "/whyjustourservice",
      });

      items.push({
        title: title.trim(),
        description: description.trim(),
        icon: uploadResponse.url,
        ...(list ? { list: list.trim() } : {}),
      });

      index++;
    }

    const service = await WhyJustOurService.create({
      module: moduleId,
      items,
    });

    return NextResponse.json(
      { success: true, data: service },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}


// GET ALL or BY MODULE (using moduleid)
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleid"); // 👈 EXACT key

    const filter: any = {};
    if (moduleId) {
      filter.module = moduleId;
    }

    const services = await WhyJustOurService.find(filter)
      .populate("module", "name")
      .sort({ createdAt: -1 });

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
