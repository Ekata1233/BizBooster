import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import WhyJustOurService from "@/models/WhyJustOurService";
import Category from "@/models/Category";

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
    

    // 🔍 Debug (recommended)
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const updateData: any = {};

    // ---------------- BASIC FIELDS ----------------
    const name = formData.get("name") as string;
    const moduleId = formData.get("module") as string;
    const imageFile = formData.get("image") as File | null;

    if (name) updateData.name = name;
    if (moduleId) updateData.module = moduleId;

    // ---------------- IMAGE UPLOAD ----------------
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      const upload = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${imageFile.name}`,
        folder: "/category",
      });

      updateData.image = upload.url;
    }

    // ---------------- UPDATE DB ----------------
    const updated = await Category
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate("module", "name");

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error(error);

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
