import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import Banner from "@/models/Banner";
import { v4 as uuidv4 } from "uuid";

// export async function POST(req: Request) {
//   await connectToDatabase();

//   try {
//     const formData = await req.formData();
//     const files = formData.getAll("images") as File[];
//     const page = formData.get("page")?.toString();
//     const category = formData.get("category")?.toString();
//     const module = formData.get("module")?.toString();

//     if (!page || !["homepage", "categorypage"].includes(page) || !category || !module) {
//       return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
//     }

//     const images: { url: string; category: string; module: string }[] = [];

//     for (const file of files) {
//       const arrayBuffer = await file.arrayBuffer();
//       const buffer = Buffer.from(arrayBuffer);

//       const upload = await imagekit.upload({
//         file: buffer,
//         fileName: `${uuidv4()}-${file.name}`,
//         folder: "/banners",
//       });

//       images.push({ url: upload.url, category, module });
//     }

//     const newBanner = await Banner.create({
//       images,
//       page,
//       isDeleted: false,
//     });

//     return NextResponse.json({ success: true, data: newBanner }, { status: 201 });
//   } catch (error: any) {
//     return NextResponse.json({ success: false, message: error.message || "Upload failed" }, { status: 500 });
//   }
// }



export async function GET() {
  await connectToDatabase();

  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: banners });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
