// import { NextRequest, NextResponse } from "next/server";
// import { connectToDatabase } from "@/utils/db";
// import imagekit from "@/utils/imagekit";
// import WhyChoose from "@/models/WhyChoose";

// export const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function GET(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop();

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: "Missing ID parameter." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const item = await WhyChoose.findById(id);

//     if (!item || item.isDeleted) {
//       return NextResponse.json(
//         { success: false, message: "WhyChoose item not found." },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       { success: true, data: item },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     const message =
//       error instanceof Error ? error.message : "An unknown error occurred";
//     return NextResponse.json(
//       { success: false, message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

// export async function PUT(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop();

//     const formData = await req.formData();
//     const title = formData.get("title") as string;
//     const description = formData.get("description") as string;
//     const extraSections = JSON.parse(formData.get("extraSections") as string);
//     const imageFile = formData.get("image") as File | null;

//     if (!title || !description || !id) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     let imageUrl: string | null = null;

//     if (imageFile && imageFile instanceof File) {
//       const buffer = Buffer.from(await imageFile.arrayBuffer());
//       const uploaded = await imagekit.upload({
//         file: buffer,
//         fileName: imageFile.name,
//       });
//       imageUrl = uploaded.url;
//     }

//     const updateData: Record<string, unknown> = {
//       title,
//       description,
//       extraSections,
//     };
//     if (imageUrl) updateData.image = imageUrl;

//     const updated = await WhyChoose.findByIdAndUpdate(id, updateData, {
//       new: true,
//     });

//     return NextResponse.json(
//       { success: true, data: updated },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     const message =
//       error instanceof Error ? error.message : "An unknown error occurred";
//     return NextResponse.json(
//       { success: false, message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

// export async function DELETE(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop();

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: "Missing ID parameter." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const deleted = await WhyChoose.findByIdAndUpdate(
//       id,
//       { isDeleted: true },
//       { new: true }
//     );

//     if (!deleted) {
//       return NextResponse.json(
//         { success: false, message: "WhyChoose item not found." },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       { success: true, message: "Soft-deleted successfully" },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     const message =
//       error instanceof Error ? error.message : "An unknown error occurred";
//     return NextResponse.json(
//       { success: false, message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import WhyChoose from "@/models/WhyChoose";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET Handler
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const item = await WhyChoose.findById(id);

    if (!item || item.isDeleted) {
      return NextResponse.json(
        { success: false, message: "WhyChoose item not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: item },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT Handler
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  try {
    const { id } = params;

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const extraSections = JSON.parse(formData.get("extraSections") as string);
    const imageFile = formData.get("image") as File | null;

    if (!title || !description || !id) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400, headers: corsHeaders }
      );
    }

    let imageUrl: string | null = null;

    if (imageFile && imageFile instanceof File) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploaded = await imagekit.upload({
        file: buffer,
        fileName: imageFile.name,
      });
      imageUrl = uploaded.url;
    }

    const updateData: Record<string, unknown> = {
      title,
      description,
      extraSections,
    };
    if (imageUrl) updateData.image = imageUrl;

    const updated = await WhyChoose.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE Handler
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deleted = await WhyChoose.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "WhyChoose item not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Soft-deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}


