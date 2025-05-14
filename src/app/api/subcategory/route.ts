import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/utils/db";

import Subcategory from "@/models/Subcategory";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// export async function GET(req: NextRequest) {
//   await connectToDatabase();

//     const { searchParams } = new URL(req.url);
//   const search = searchParams.get("search") || "";

//   try {
//     const data = await Subcategory.find().populate("category");
//     return NextResponse.json({ success: true, data }, { status: 200, headers: corsHeaders });
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: (error as Error).message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  try {
    // Fetch all subcategories with populated 'category'
    const subcategories = await Subcategory.find().populate("category");

    // Filter in-memory for `name` and `category.name`
    let filteredSubcategories = subcategories;

    if (search) {
      const regex = new RegExp(search, "i");
      filteredSubcategories = subcategories.filter((sub) =>
        regex.test(sub.name) || regex.test(sub.category?.name)
      );
    }

    return NextResponse.json(
      { success: true, data: filteredSubcategories },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
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

    if (!name || !category) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
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
