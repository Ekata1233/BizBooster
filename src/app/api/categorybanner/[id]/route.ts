import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import CategoryBanner from "@/models/CategoryBanner";
import { v4 as uuidv4 } from "uuid";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
const getIdFromReq = (req: Request) => {
  const url = new URL(req.url);
  return url.pathname.split("/").pop();
};
/* ================= UPDATE ================= */
export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const id = getIdFromReq(req);
    const formData = await req.formData();

    const module = formData.get("module") as string;
    const file = formData.get("image") as File | null;

    const updateData: any = { module };

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const upload = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${file.name}`,
        folder: "/categorybanner",
      });

      updateData.image = upload.url;
    }

    const updated = await CategoryBanner.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

/* ================= DELETE ================= */
export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const id = getIdFromReq(req);
    await CategoryBanner.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Category banner deleted" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
