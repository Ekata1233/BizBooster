import { NextRequest, NextResponse } from "next/server";
import WhyChoose from "@/models/WhyChoose";
import imagekit from "@/utils/imagekit";
import { connectToDatabase } from "@/utils/db";

// Move corsHeaders inside the file without exporting it
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  await connectToDatabase();
  const data = await WhyChoose.find({ isDeleted: false }).sort({ createdAt: -1 });
  return NextResponse.json(data, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const formData = await req.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const extraSections = JSON.parse(formData.get("extraSections") as string); // array of { description }

  const imageFile = formData.get("image") as File;
  const buffer = Buffer.from(await imageFile.arrayBuffer());

  const uploaded = await imagekit.upload({
    file: buffer,
    fileName: imageFile.name,
  });

  const newEntry = await WhyChoose.create({
    title,
    description,
    image: uploaded.url,
    extraSections,
  });

  return NextResponse.json(newEntry, { headers: corsHeaders });
}
