import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import Banner from "@/models/Banner";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Image is required." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: `${uuidv4()}-${file.name}`,
      folder: "/uploads",
    });

    const newBanner = await Banner.create({
      image: uploadResponse.url,
    });

    return NextResponse.json({ success: true, data: newBanner }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  await connectToDatabase();

  try {
    const banners = await Banner.find({ isDeleted: false }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: banners });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
