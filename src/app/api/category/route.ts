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

  try {
    // Always fetch all with populate
const categories = await Category.find({})
  .populate("module")
  .sort({ sortOrder: 1, createdAt: 1 }); // ✅ SORT BY order

    // Filter in-memory for `name` and `module.name`
    let filteredCategories = categories;

  

    if (search || selectedModule) {
      const regex = search ? new RegExp(search, "i") : null;

      filteredCategories = categories.filter((cat) => {
        const matchesSearch = regex
          ? regex.test(cat.name) || regex.test(cat.module?.name)
          : true;

        const matchesModule = selectedModule
          ? cat.module?._id?.toString() === selectedModule
          : true;

        return matchesSearch && matchesModule;
      });
    }


    const categoriesWithSubcategoryCount = await Promise.all(
      filteredCategories.map(async (category) => {
        // Count the number of subcategories related to this category
        const subcategoryCount = await Subcategory.countDocuments({
          category: category._id,
            isDeleted: false,
        });

        // Return category with subcategory count
        return {
          ...category.toObject(),
          subcategoryCount,
        };
      })
    );

    return NextResponse.json(
      { success: true, data: categoriesWithSubcategoryCount },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}