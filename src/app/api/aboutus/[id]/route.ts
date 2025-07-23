import { NextResponse } from "next/server";
import mongoose from "mongoose";
import AboutUs from "@/models/AboutUs";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Sanitize input to prevent script injections
function sanitizeContent(raw: string): string {
  if (!raw) return '';
  return raw.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
}

export async function PUT(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid About Us ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => null);
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json(
        { success: false, message: "Content is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const sanitizedContent = sanitizeContent(content);

    const updated = await AboutUs.findByIdAndUpdate(
      id,
      { content: sanitizedContent },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Content not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("PUT /api/aboutus/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid About Us ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deleted = await AboutUs.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Content not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Content deleted successfully.",
        data: { id },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
