import { NextRequest, NextResponse } from "next/server";

import { v4 as uuidv4 } from "uuid";
import Module from "@/models/Module";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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
export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  console.log("search params in module : ", searchParams);
  const search = searchParams.get('search');

  const filter: {
    $or?: { [key: string]: { $regex: string; $options: string } }[];
  } = {};

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    filter.$or = [
      { name: searchRegex },
    ];
  }

  try {
    const modules = await Module.find(filter);
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

