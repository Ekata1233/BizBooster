import { NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

import Module from "@/models/Module";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Preflight Handler
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ Create New Module
export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Ensure upload folder exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    let imageUrl = "";
    const file = formData.get("image") as File;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadDir, file.name);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${file.name}`;
    }

    const newModule = await Module.create({
      name,
      image: imageUrl,
    });

    return NextResponse.json(
      { success: true, data: newModule },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 400, headers: corsHeaders }
    );
  }
}

// ✅ Get All Modules
export async function GET() {
  await connectToDatabase();

  try {
    const modules = await Module.find({});
    return NextResponse.json(
      { success: true, data: modules },
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

