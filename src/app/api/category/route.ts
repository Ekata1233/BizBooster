import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Category from "@/models/Category";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import Subcategory from "@/models/Subcategory";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const moduleId = formData.get("module") as string; // renamed variable

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

    const newCategory = await Category.create({
      name,
      module: moduleId, // keep field name as 'module'
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

// export async function GET(req: NextRequest) {
//   await connectToDatabase();

//   const { searchParams } = new URL(req.url);
//   console.log("search params in module : ", searchParams);
//   const search = searchParams.get('search');

//   const filter: {
//     $or?: { [key: string]: { $regex: string; $options: string } }[];
//   } = {};

//   if (search) {
//     const searchRegex = { $regex: search, $options: 'i' };
//     filter.$or = [
//       { name: searchRegex },
//       { module: searchRegex },
//     ];
//   }

//   try {
//     const categories = await Category.find(filter).populate("module");
//     return NextResponse.json(
//       { success: true, data: categories },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     const err = error as Error;
//     return NextResponse.json(
//       { success: false, message: err.message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const selectedModule = searchParams.get("selectedModule") || "";

  try {
    // Always fetch all with populate
    const categories = await Category.find({}).populate("module");

    // Filter in-memory for `name` and `module.name`
    let filteredCategories = categories;

    // if (search) {
    //   const regex = new RegExp(search, "i");
    //   filteredCategories = categories.filter((cat) => 
    //     regex.test(cat.name) || regex.test(cat.module?.name) 
    //   );
    // }

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