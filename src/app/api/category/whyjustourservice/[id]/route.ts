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

// GET BY ID
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const service = await WhyJustOurService
    .findById(params.id)
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
}


// UPDATE
// UPDATE
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    const moduleId = formData.get("module") as string;

    const updateData: any = {};
    if (moduleId) updateData.module = moduleId;

    // 🔹 REBUILD ITEMS ARRAY
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
        const uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${iconFile.name}`,
          folder: "/whyjustourservice",
        });
        iconUrl = uploadResponse.url;
      }

      items.push({
        title,
        description,
        icon: iconUrl,
      });

      index++;
    }

    if (items.length) updateData.items = items;

    const updatedService = await WhyJustOurService.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate("module", "name");

    return NextResponse.json(
      { success: true, data: updatedService },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400, headers: corsHeaders }
    );
  }
}


// DELETE
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  try {
    await WhyJustOurService.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: corsHeaders });
  }
}
