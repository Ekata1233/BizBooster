import { NextResponse } from "next/server";

import { v4 as uuidv4 } from "uuid";

import Module from "@/models/Module";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Preflight Handler
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ Create New Module
// export async function POST(req: Request) {
//   await connectToDatabase();

//   try {
//     const formData = await req.formData();

//     const name = formData.get("name") as string;

//     if (!name) {
//       return NextResponse.json(
//         { success: false, message: "Name is required." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Ensure upload folder exists
//     const uploadDir = path.join(process.cwd(), "public/uploads");
//     if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

//     let imageUrl = "";
//     const file = formData.get("image") as File;

//     if (file) {
//       const bytes = await file.arrayBuffer();
//       const buffer = Buffer.from(bytes);
//       const filePath = path.join(uploadDir, file.name);
//       await writeFile(filePath, buffer);
//       imageUrl = `/uploads/${file.name}`;
//     }

//     const newModule = await Module.create({
//       name,
//       image: imageUrl,
//     });

//     return NextResponse.json(
//       { success: true, data: newModule },
//       { status: 201, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json(
//       { success: false, message },
//       { status: 400, headers: corsHeaders }
//     );
//   }
// }

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
export async function GET() {
  await connectToDatabase();

  try {
    const modules = await Module.find({});
    return NextResponse.json(
      { success: true, data: modules },
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

