import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import TermsConditions from "@/models/TermsConditions";
import mongoose from "mongoose";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Sanitize content to prevent script injection
function sanitizeContent(raw: string): string {
  if (!raw) return '';
  return raw.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
}

// ✅ PUT handler for updating TermsConditions
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop(); // Extract ID from URL

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing TermsConditions ID.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const content = typeof body?.content === 'string' ? body.content.trim() : '';

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Terms and Conditions content is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanContent = sanitizeContent(content);

    const updated = await TermsConditions.findByIdAndUpdate(
      id,
      { content: cleanContent },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Terms and Conditions content not found.' },
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

// ✅ DELETE handler for removing TermsConditions
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop(); // Extract ID from URL

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing TermsConditions ID.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const deleted = await TermsConditions.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Terms and Conditions content not found.' },
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
