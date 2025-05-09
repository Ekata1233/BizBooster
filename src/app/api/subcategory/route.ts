import { NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { connectToDatabase } from "@/utils/db";

import Subcategory from "@/models/Subcategory";
import Category from "@/models/Category"; // ✅ this is the fix

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  await connectToDatabase();

  try {
    const data = await Subcategory.find({ isDeleted: false }).populate("category");
    return NextResponse.json({ success: true, data }, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const file = formData.get("image") as File;

    if (!name || !category) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    let imageUrl = "";
    if (file) {
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadDir, file.name);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${file.name}`;
    }

    const newSubcategory = await Subcategory.create({ name, category, image: imageUrl });
    return NextResponse.json(
      { success: true, data: newSubcategory },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 400, headers: corsHeaders }
    );
  }
}
