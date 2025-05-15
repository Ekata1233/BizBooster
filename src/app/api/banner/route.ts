import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import Banner from "@/models/Banner";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    console.log("formadata of the banner : ", formData)
    const files = formData.getAll("newImages") as File[];
    const page = formData.get("page")?.toString();
    // const category = formData.get("category")?.toString();
    // const module = formData.get("module")?.toString();
    const category = JSON.parse(formData.get("category")?.toString() || "[]");
    const module = JSON.parse(formData.get("module")?.toString() || "[]");


    if (!page || !["homepage", "categorypage"].includes(page) || !category || !module) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const images: { url: string; category: string; module: string }[] = [];

    // for (const file of files) {
    //   const arrayBuffer = await file.arrayBuffer();
    //   const buffer = Buffer.from(arrayBuffer);

    //   const upload = await imagekit.upload({
    //     file: buffer,
    //     fileName: `${uuidv4()}-${file.name}`,
    //     folder: "/banners",
    //   });

    //   images.push({ url: upload.url, category, module });
    // }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const upload = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${file.name}`,
        folder: "/banners",
      });

      images.push({
        url: upload.url,
        category: category[i], // array item
        module: module[i],     // array item
      });
    }

console.log("gfgbdg",Banner);

    const newBanner = await Banner.create({
      images,
      page,
      isDeleted: false,
    });

    return NextResponse.json({ success: true, data: newBanner }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Upload failed" }, { status: 500 });
  }
}



export async function GET() {
  await connectToDatabase();

  try {
    const banners = await Banner.find().sort();
    return NextResponse.json({ success: true, data: banners });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
