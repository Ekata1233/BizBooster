import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import Banner from "@/models/Banner";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];
    const page = formData.get("page")?.toString();

    if (!page || !["homepage", "categorypage"].includes(page)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing page" },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No images uploaded" },
        { status: 400 }
      );
    }

    const uploadedImageUrls: string[] = [];

    for (const file of files) {
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const upload = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${file.name}`,
          folder: "/banners",
        });

        uploadedImageUrls.push(upload.url);
      }
    }

    const newBanner = await Banner.create({
      images: uploadedImageUrls,
      page,
    });

    return NextResponse.json(
      { success: true, data: newBanner },
      { status: 201 }
    );
  } catch (error: unknown) {
  let errorMessage = "Upload failed";

  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return NextResponse.json(
    { success: false, message: errorMessage },
    { status: 500 }
  );
}
}

export async function GET() {
  await connectToDatabase();

  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: banners });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
