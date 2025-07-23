import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import RefundPolicy from "@/models/RefundPolicy";
import mongoose from "mongoose";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// utility to sanitize content
function sanitizeContent(raw: string): string {
  if (!raw) return '';
  return raw.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
}

// ✅ Correct PUT handler
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop(); // Extract ID from URL

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing ID.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const content = typeof body?.content === 'string' ? body.content.trim() : '';

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Refund Policy content is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanContent = sanitizeContent(content);

    const updated = await RefundPolicy.findByIdAndUpdate(
      id,
      { content: cleanContent },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Content not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Updated successfully.', data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ Correct DELETE handler
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop(); // Extract ID from URL

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing ID.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const deleted = await RefundPolicy.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Content not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Deleted successfully.', data: deleted },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
