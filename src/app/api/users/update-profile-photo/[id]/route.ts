
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import User from "@/models/User";
import { v4 as uuidv4 } from "uuid";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

export async function PATCH(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID not provided in URL" },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await req.formData();

    console.log("form data of profile photo : ", formData)
    const file = formData.get("profilePhoto") as File | null;

    if (!file || !file.name) {
      return NextResponse.json(
        { success: false, message: "No profile photo uploaded" },
        { status: 400, headers: corsHeaders }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: `${uuidv4()}-${file.name}`,
      folder: "/users/profilePhotos",
    });

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { profilePhoto: uploadResponse.url } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedUser },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
