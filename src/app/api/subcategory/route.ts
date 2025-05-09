import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Subcategory from "@/models/Subcategory";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

export async function GET() {
  await connectToDatabase();
  const data = await Subcategory.find({ isDeleted: false }).populate("category");
  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  await connectToDatabase();
  const formData = await req.formData();

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const file = formData.get("image") as File;

  if (!name || !category) {
    return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
  }

  let imageUrl = "";
  if (file && typeof file === "object" && file instanceof File) {
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer);
    imageUrl = `/uploads/${file.name}`;
  }

  const newSubcategory = await Subcategory.create({ name, category, image: imageUrl });
  return NextResponse.json({ success: true, data: newSubcategory });
}
