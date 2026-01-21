import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Mentor from "@/models/Mentor";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import "@/models/Service";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/* =========================
   GET MENTORS BY SERVICE ID
========================= */
export async function GET(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const serviceId = url.pathname.split("/").pop();

  const mentors = await Mentor.find({ service: serviceId }).populate(
    "service",
    "serviceName"
  );

  return NextResponse.json(
    { success: true, data: mentors },
    { headers: corsHeaders }
  );
}

/* =========================
   UPDATE MENTOR BY SERVICE ID
========================= */
export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const serviceId = url.pathname.split("/").pop();

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const position = formData.get("position") as string;

    let imageUrl = formData.get("existingImage") as string;

    const file = formData.get("image") as File;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const upload = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${file.name}`,
        folder: "/mentor",
      });

      imageUrl = upload.url;
    }

    const updatedMentor = await Mentor.findOneAndUpdate(
      { service: serviceId },
      { name, position, image: imageUrl },
      { new: true }
    );

    return NextResponse.json(
      { success: true, data: updatedMentor },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

/* =========================
   DELETE MENTOR BY SERVICE ID
========================= */
export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const serviceId = url.pathname.split("/").pop();

    await Mentor.deleteMany({ service: serviceId });

    return NextResponse.json(
      { success: true, message: "Mentors deleted for this service" },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
