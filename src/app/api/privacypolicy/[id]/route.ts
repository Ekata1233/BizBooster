import { NextRequest, NextResponse } from "next/server";

// import { v4 as uuidv4 } from "uuid";
import PrivacyPolicy from "@/models/PrivacyPolicy";
import { connectToDatabase } from "@/utils/db";
import mongoose from "mongoose";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};



export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Privacy Policy id is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Privacy Policy id.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => null);
    const content = typeof body?.content === 'string' ? body.content.trim() : '';

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Privacy Policy content is required.' },
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
        { success: false, message: 'Privacy Policy not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('PUT /api/privacypolicy/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
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
      { success: false, message: 'Invalid Privacy Policy ID.' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const deleted = await PrivacyPolicy.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Privacy Policy content not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Privacy Policy content deleted successfully.', data: { id } },
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
