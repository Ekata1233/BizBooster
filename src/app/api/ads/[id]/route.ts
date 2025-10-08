import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/utils/db";
import { Ad } from "@/models/Ad";
import imagekit from "@/utils/imagekit";
import "@/models/Category"
import "@/models/Service"
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ GET SPECIFIC AD
export async function GET(req: Request) {
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

    // const ad = await Ad.findById(id);
        const ad = await Ad.findById(id).populate("category service provider");
    

    if (!ad) {
      return NextResponse.json(
        { success: false, message: "Ad not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: ad },
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

// ✅ UPDATE AD
export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    const formData = await req.formData();

    const addType = formData.get("addType") as string;
    const category = formData.get("category") as string;
    const service = formData.get("service") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!id || !addType || !category || !service || !startDate || !endDate || !title) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400, headers: corsHeaders }
      );
    }

    let fileUrl = "";
    const file = formData.get("file") as File | null;

    if (file && file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${file.name}`,
        folder: "/ads",
      });

      fileUrl = uploadResponse.url;
    }

    // ✅ Build update data
    const updateData: Record<string, unknown> = {
      addType,
      category,
      service,
      startDate,
      endDate,
      title,
      description,
    };

    if (fileUrl) updateData.fileUrl = fileUrl;

    // ✅ Handle isExpired logic
    const currentDate = new Date();
    const end = new Date(endDate);

    // If endDate is in the past or today → expired
    let isExpired = end < currentDate || end.toDateString() === currentDate.toDateString();

    // When ad is updated with new endDate → recheck and reset isExpired if needed
    updateData.isExpired = isExpired;

    const updatedAd = await Ad.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(
      { success: true, data: updatedAd },
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


// ✅ DELETE AD (Soft Delete)
export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    console.log("id of ads deleted  : ", id);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Soft delete: set isDeleted to true instead of removing
    const deletedAd = await Ad.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedAd) {
      return NextResponse.json(
        { success: false, message: "Ad not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Ad deleted successfully (soft delete)." },
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

