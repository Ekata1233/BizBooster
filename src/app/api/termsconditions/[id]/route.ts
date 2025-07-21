import { NextRequest, NextResponse } from "next/server";

// import { v4 as uuidv4 } from "uuid";
import TermsConditions from "@/models/TermsConditions";
import { connectToDatabase } from "@/utils/db";
import mongoose from "mongoose";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};



function sanitizeContent(raw: string): string {
  if (!raw) return '';

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
        { success: false, message: 'Refund Policy id is required in the route.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Terms and Conditions id.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse body
    const body = await req.json().catch(() => null);
    const content = typeof body?.content === 'string' ? body.content.trim() : '';

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Terms and Conditions section content is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // (Optional) sanitize
    const cleanContent = sanitizeContent(content);

    // Update
    const updated = await TermsConditions.findByIdAndUpdate(
      id,
      { content: cleanContent },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Terms and Conditions content not found to update.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error updating Terms and Conditions.';
    console.error('PUT Terms and Conditions Error:', error);
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
      { success: false, message: 'Invalid Terms and Conditions ID.' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const deleted = await TermsConditions.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Terms and Conditions content not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Terms and Conditions content deleted successfully.', data: { id } },
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
