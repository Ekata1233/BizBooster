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

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const categories = JSON.parse(formData.get("categories") as string);
    const id = params.id;

    if (!name || !id) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400, headers: corsHeaders }
      );
    }

    let imageUrl = "";
    const file = formData.get("image") as File;

    if (file && typeof file === "object") {
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadDir, file.name);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${file.name}`;
    }

    const updateData: any = {
      name,
      categories,
    };
    if (imageUrl) updateData.image = imageUrl;

    const updatedModule = await Module.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(
      { success: true, data: updatedModule },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400, headers: corsHeaders }
    );
  }
}
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
  ) {
    await connectToDatabase();
  
    try {
      const { id } = params;
  
      const deletedModule = await Module.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );
  
      if (!deletedModule) {
        return NextResponse.json(
          { success: false, message: "Module not found" },
          { status: 404, headers: corsHeaders }
        );
      }
  
      return NextResponse.json(
        { success: true, message: "Module soft-deleted successfully" },
        { status: 200, headers: corsHeaders }
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500, headers: corsHeaders }
      );
    }
  }
  