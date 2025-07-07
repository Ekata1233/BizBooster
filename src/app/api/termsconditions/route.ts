import { NextRequest, NextResponse } from "next/server";

// import { v4 as uuidv4 } from "uuid";
import TermsConditions from "@/models/TermsConditions";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};









export async function GET() { // Changed Request to NextRequest for consistency
  
  await connectToDatabase();
  try {
    const aboutUsEntries = await TermsConditions.find({}); // This correctly returns an array

    // If no entries, return an empty array with success true
    if (!aboutUsEntries || aboutUsEntries.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200, headers: corsHeaders });
    }

    return NextResponse.json(
      { success: true, data: aboutUsEntries }, // THIS IS THE KEY: it returns aboutUsEntries (an array)
      { status: 200, headers: corsHeaders }
    );
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
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
        { success: false, message: "About us content is required and must be a string." },
        { status: 400, headers: corsHeaders }
      );
    }

    const newAboutUsEntry = await TermsConditions.create({ content }); // Create a new document

    return NextResponse.json(
      { success: true, data: newAboutUsEntry },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('Backend POST /api/aboutus error:', error);
    return NextResponse.json(
      { success: false, message: (error as Error).message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}