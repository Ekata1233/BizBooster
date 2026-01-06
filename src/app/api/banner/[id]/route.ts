import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Banner from "@/models/Banner";
import imagekit from "@/utils/imagekit";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    const formData = await req.formData();


    console.log("formdata : ", formData);

    const page = formData.get("page") as string;
    const selectionType = formData.get("selectionType") as string;

    if (!page || !selectionType || !id) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400, headers: corsHeaders }
      );
    }

    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const service = formData.get("service") as string;
    const referralUrl = formData.get("referralUrl") as string;
    const screenCategory = formData.get("whichCategory") as string;
    const module = formData.get("module") as string;

console.log("module : ",module);

    let fileUrl = "";
    const file = formData.get("file") as File | null;

    if (file && file.size > 0) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadResponse = await imagekit.upload({
    file: buffer,
    fileName: `${uuidv4()}-${file.name}`,
    folder: "/banner",
  });

  fileUrl = uploadResponse.url;
}

    const updateData: Record<string, unknown> = {
      page,
      selectionType,
      category: category || undefined,
      subcategory: subcategory || undefined,
      service: service || undefined,
      referralUrl: referralUrl || undefined,
      screenCategory: screenCategory || undefined,
      module: module || undefined,
      isDeleted: false,
    };

    if (fileUrl) updateData.file = fileUrl;

    const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(
      { success: true, data: updatedBanner },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 400, headers: corsHeaders }
    );
  }
}

export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deletedBanner = await Banner.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedBanner) {
      return NextResponse.json(
        { success: false, message: "Banner not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Banner soft-deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
