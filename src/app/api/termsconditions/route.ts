import { NextRequest, NextResponse } from "next/server";

// import { v4 as uuidv4 } from "uuid";
import TermsConditions from "@/models/TermsConditions";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};








export async function GET() {
  await connectToDatabase();
  try {
    const doc = await TermsConditions.findOne().sort({ createdAt: 1 });

    // For backward compat with existing frontend that expects an array
    const dataArray = doc ? [doc] : [];

    return NextResponse.json(
      { success: true, data: dataArray },
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


export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const { content } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Terms and Conditions content is required and must be a string.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if there's an existing document
    const existing = await TermsConditions.findOne();

    if (existing) {
      // Replace the existing content
      existing.content = content;
      await existing.save();

      return NextResponse.json(
        { success: true, data: existing, message: 'Terms and Conditions content replaced successfully.' },
        { status: 200, headers: corsHeaders }
      );
    }

    // If no document exists, create a new one
    const newEntry = await TermsConditions.create({ content });

    return NextResponse.json(
      { success: true, data: newEntry, message: 'Terms and Conditions content created successfully.' },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('POST /api/termsconditions error:', error);
    return NextResponse.json(
      { success: false, message: (error as Error).message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
