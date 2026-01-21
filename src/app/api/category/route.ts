import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Category from "@/models/Category";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import Subcategory from "@/models/Subcategory";
import "@/models/Module"
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    // ✅ Check if this is a reorder request (JSON body)
    const contentType = req.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const { categories } = await req.json();

      if (Array.isArray(categories)) {
        for (let item of categories) {
          await Category.findByIdAndUpdate(item._id, { sortOrder: item.sortOrder });
        }

        return NextResponse.json(
          { success: true, message: "Category order updated" },
          { status: 200, headers: corsHeaders }
        );
      }
    }

    // ✅ Otherwise, treat as form-data: CREATE CATEGORY (your original code)
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const moduleId = formData.get("module") as string;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const existing = await Category.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") },
      isDeleted: false
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 400, headers: corsHeaders }
      );
    }

    let imageUrl = "";
    const file = formData.get("image") as File;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${file.name}`,
        folder: "/uploads",
      });

      imageUrl = uploadResponse.url;
    }

    const newCategory = await Category.create({
      name,
      module: moduleId,
      image: imageUrl,
    });

    return NextResponse.json(
      { success: true, data: newCategory },
      { status: 201, headers: corsHeaders }
    );

  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400, headers: corsHeaders }
    );
  }
}




export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const selectedModule = searchParams.get("selectedModule") || "";
  const moduleId = searchParams.get("moduleId") || "";

  try {
    const query: any = { isDeleted: false };

    // 🔹 Priority: moduleId > selectedModule
    if (moduleId) {
      query.module = moduleId;
    } else if (selectedModule) {
      query.module = selectedModule;
    }

    // 🔹 Search category name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // 1️⃣ Fetch categories
    const categories = await Category.find(query)
      .populate("module")
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean(); // IMPORTANT

    // 2️⃣ Get subcategory counts in ONE query
    const subcategoryCounts = await Subcategory.aggregate([
      {
        $match: {
          isDeleted: false,
          category: { $in: categories.map(c => c._id) },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    // 3️⃣ Convert counts to map
    const countMap: Record<string, number> = {};
    subcategoryCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    // 4️⃣ Attach count to each category
    const finalData = categories.map(category => ({
      ...category,
      subcategoryCount: countMap[category._id.toString()] || 0,
    }));

    return NextResponse.json(
      { success: true, data: finalData },
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

