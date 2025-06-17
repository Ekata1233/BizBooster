import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import ServiceMan from "@/models/ServiceMan";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET handler
export async function GET(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const serviceman = await ServiceMan.findById(id);
    if (!serviceman) {
      return NextResponse.json(
        { success: false, message: "ServiceMan not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    return NextResponse.json(
      { success: true, data: serviceman },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching ServiceMan" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT handler
export async function PUT(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const formData = await req.formData();

    const updates: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key === "generalImage" || key === "identityImage") {
        const file = value as File;
        if (file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${file.name}`,
            folder: "/serviceman",
          });

          if (key === "generalImage") {
            updates.generalImage = uploadResponse.url;
          } else {
            updates["businessInformation.identityImage"] = uploadResponse.url;
          }
        }
      } else {
        if (key.startsWith("businessInformation.")) {
          const nestedKey = key.split(".")[1];
          updates[`businessInformation.${nestedKey}`] = value;
        } else {
          updates[key] = value;
        }
      }
    }

    const updatedServiceMan = await ServiceMan.findByIdAndUpdate(id, updates, {
      new: true,
    });

    return NextResponse.json(
      { success: true, data: updatedServiceMan },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during update";
    return NextResponse.json(
      { success: false, message },
      { status: 400, headers: corsHeaders }
    );
  }
}

// DELETE handler
export async function DELETE(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const deleted = await ServiceMan.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "ServiceMan not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Deleted successfully" },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error deleting ServiceMan" },
      { status: 500, headers: corsHeaders }
    );
  }
}
