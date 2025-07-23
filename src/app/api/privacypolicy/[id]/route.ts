import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import PrivacyPolicy from "@/models/PrivacyPolicy";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function PUT(req: NextRequest) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Privacy Policy ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => null);
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json(
        { success: false, message: "Privacy Policy content is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const updated = await PrivacyPolicy.findByIdAndUpdate(
      id,
      { content },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Privacy Policy not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error updating Privacy Policy.";
    console.error("PUT PrivacyPolicy Error:", error);
    return NextResponse.json(
      { success: false, message },
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
        { success: false, message: "Invalid Privacy Policy ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deleted = await PrivacyPolicy.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Privacy Policy not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Privacy Policy deleted successfully.",
        data: { id },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error deleting Privacy Policy.";
    console.error("DELETE PrivacyPolicy Error:", error);
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
