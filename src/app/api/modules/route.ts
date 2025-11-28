import { NextRequest, NextResponse } from "next/server";

import { v4 as uuidv4 } from "uuid";
import Module from "@/models/Module";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import Category from "@/models/Category";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

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
//     ];
//   }

//   try {
//     const modules = await Module.find(filter);
//      const modulesWithCategoryCount = await Promise.all(modules.map(async (module) => {
//       // Count categories related to each module
//       const categoryCount = await Category.countDocuments({ module: module._id});
      
//       // Add category count to each module
//       return {
//         ...module.toObject(),
//         categoryCount,
//       };
//     }));
//     return NextResponse.json(
//       { success: true, data: modulesWithCategoryCount },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json(
//       { success: false, message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  const filter: any = {};

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    filter.$or = [{ name: searchRegex }];
  }

  try {

    const modules = await Module.aggregate([
      { $match: filter },

      // ✅ Add sortKey for "Franchise"
      {
        $addFields: {
          sortKey: { $cond: [{ $eq: ["$name", "Franchise"] }, 0, 1] }
        }
      },

      // ✅ FIRST sort Franchise → THEN sort by sortOrder
      {
        $sort: {sortOrder: 1 }
      }
    ]);

    // ✅ Count categories
    const modulesWithCategoryCount = await Promise.all(
      modules.map(async (module) => {
        const categoryCount = await Category.countDocuments({ module: module._id });
        return { ...module, categoryCount };
      })
    );

    // ✅ Get last update date
    const latestUpdated = await Module.aggregate([
      { $group: { _id: null, latestUpdatedAt: { $max: "$updatedAt" } } }
    ]);

    const newUpdatedAt = latestUpdated.length > 0 ? latestUpdated[0].latestUpdatedAt : null;

    return NextResponse.json(
      { success: true, data: modulesWithCategoryCount, newUpdatedAt },
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Unknown error" },
      { status: 500, headers: corsHeaders }
    );
  }
}


