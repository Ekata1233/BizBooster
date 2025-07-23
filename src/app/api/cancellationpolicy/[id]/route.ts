import { NextResponse } from "next/server";
import mongoose from "mongoose";
import CancellationPolicy from "@/models/CancellationPolicy";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function PUT(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Cancellation Policy ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => null);
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json(
        { success: false, message: "Cancellation Policy section content is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const updated = await CancellationPolicy.findByIdAndUpdate(
      id,
      { content },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Cancellation Policy content not found to update." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error updating Cancellation Policy.";
    console.error("PUT Cancellation Policy Error:", error);
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
        { success: false, message: "Invalid Cancellation Policy ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deleted = await CancellationPolicy.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Cancellation Policy content not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cancellation Policy content deleted successfully.",
        data: { id },
      },
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
