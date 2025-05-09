import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Category from "@/models/Category";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const moduleId = formData.get("module") as string; // renamed variable

     if (!name) {
          return NextResponse.json(
            { success: false, message: "Name is required." },
            { status: 400, headers: corsHeaders }
          );
        }

let imageUrl = "";
    const file = formData.get("image") as File;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResponse = await imagekit.upload({
        file: buffer, // binary file
        fileName: `${uuidv4()}-${file.name}`,
        folder: "/uploads", // optional folder in ImageKit
      });

      imageUrl = uploadResponse.url;
    }

    const newCategory = await Category.create({
      name,
      module: moduleId, // keep field name as 'module'
      image: imageUrl,
    });

    return NextResponse.json(
      { success: true, data: newCategory },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400, headers: corsHeaders }
    );
  }
}

export async function GET() {
  await connectToDatabase();

  try {
    const categories = await Category.find({ isDeleted: false }).populate("module");
    return NextResponse.json(
      { success: true, data: categories },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
