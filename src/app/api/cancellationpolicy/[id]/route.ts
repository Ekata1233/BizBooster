import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
// import { v4 as uuidv4 } from "uuid";
import CancellationPolicy from "@/models/CancellationPolicy";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function sanitizeContent(raw: string): string {
  if (!raw) return '';
  // Example: strip <script> tags (non-exhaustive!)
  return raw.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Cancellation Policy id is required in the route.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Cancellation Policy id.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse body
    const body = await req.json().catch(() => null);
    const content = typeof body?.content === 'string' ? body.content.trim() : '';

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Cancellation Policy section content is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // (Optional) sanitize
    const cleanContent = sanitizeContent(content);

    // Update
    const updated = await CancellationPolicy.findByIdAndUpdate(
      id,
      { content: cleanContent },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Cancellation Policy content not found to update.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error updating Cancellation Policy.';
    console.error('PUT Cancellation Policy Error:', error);
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const { id } = params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid Cancellation Policy ID.' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const deleted = await CancellationPolicy.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Cancellation Policy content not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Cancellation Policy content deleted successfully.', data: { id } },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
