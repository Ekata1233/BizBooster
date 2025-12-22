import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import WhyJustOurService from "@/models/WhyJustOurService";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

const getIdFromReq = (req: Request) => {
  const url = new URL(req.url);
  return url.pathname.split("/").pop();
};


// ✅ GET BY ID
export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const id = getIdFromReq(req);

    const service = await WhyJustOurService
      .findById(id)
      .populate("module", "name");

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: service },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}


// ✅ UPDATE
export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const id = getIdFromReq(req);
    const formData = await req.formData();

    const moduleId = formData.get("module") as string;
    const updateData: any = {};
    if (moduleId) updateData.module = moduleId;

    // 🔹 rebuild items array
    const items: any[] = [];
    let index = 0;

    while (formData.get(`items[${index}][title]`)) {
      const title = formData.get(`items[${index}][title]`) as string;
      const description = formData.get(`items[${index}][description]`) as string;
      const iconFile = formData.get(`items[${index}][icon]`) as File | null;
      const oldIcon = formData.get(`items[${index}][oldIcon]`) as string;

      let iconUrl = oldIcon;

      if (iconFile) {
        const buffer = Buffer.from(await iconFile.arrayBuffer());
        const upload = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${iconFile.name}`,
          folder: "/whyjustourservice",
        });
        iconUrl = upload.url;
      }

      items.push({ title, description, icon: iconUrl });
      index++;
    }

    if (items.length) updateData.items = items;

    const updated = await WhyJustOurService
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate("module", "name");

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400, headers: corsHeaders }
    );
  }
}


// ✅ DELETE
export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const id = getIdFromReq(req);
    await WhyJustOurService.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
