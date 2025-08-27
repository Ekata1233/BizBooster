// import { NextResponse } from "next/server";
// import Deposite from "@/models/Deposite";
// import { connectToDatabase } from "@/utils/db";

// export async function GET(req: Request) {
//   try {
//     await connectToDatabase();
//     const url = new URL(req.url);
//     const user = url.searchParams.get("user"); // optional filter by user id

//     const query: any = {};
//     if (user) query.user = user;

//     const deposites = await Deposite.find(query).sort({ createdAt: -1 });
//     return NextResponse.json({ success: true, data: deposites }, { status: 200 });
//   } catch (error) {
//     console.error("GET /api/deposites error:", error);
//     return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
//   }
// }

// export async function POST(req: Request) {
//   try {
//     await connectToDatabase();
//     const body = await req.json();

//     const { user, packagePrice, monthlyEarnings, lockInPeriod, deposite, packageActivateDate } = body ?? {};

//     if (!user || packagePrice == null || monthlyEarnings == null || lockInPeriod == null || deposite == null) {
//       return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
//     }

//     const created = await Deposite.create({
//       user,
//       packagePrice: Number(packagePrice),
//       monthlyEarnings: Number(monthlyEarnings),
//       lockInPeriod: Number(lockInPeriod),
//       deposite: Number(deposite),
//       packageActivateDate: packageActivateDate ? new Date(packageActivateDate) : null,
//     });

//     return NextResponse.json({ success: true, data: created }, { status: 201 });
//   } catch (error) {
//     console.error("POST /api/deposites error:", error);
//     return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
//   }
// }
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
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
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
     const modulesWithCategoryCount = await Promise.all(modules.map(async (module) => {
      // Count categories related to each module
      const categoryCount = await Category.countDocuments({ module: module._id});
      
      // Add category count to each module
      return {
        ...module.toObject(),
        categoryCount,
      };
    }));
    return NextResponse.json(
      { success: true, data: modulesWithCategoryCount },
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

