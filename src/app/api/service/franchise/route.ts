import { NextRequest, NextResponse } from 'next/server';
import Franchise from '@/models/ExtraService';
import { connectToDatabase } from '@/utils/db';
import { Types } from 'mongoose';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// POST - Create a new franchise
export async function POST(req: Request) {
  await connectToDatabase();
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.serviceId || !data.investment || !data.model) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400, headers: corsHeaders });
    }

    // Convert serviceId to ObjectId if it's a string
    if (typeof data.serviceId === "string") {
      data.serviceId = new Types.ObjectId(data.serviceId);
    }

    const newFranchise = await Franchise.create(data);

    return NextResponse.json({ success: true, data: newFranchise }, { status: 201, headers: corsHeaders });

  } catch (err: any) {
    console.error('POST /api/franchise error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders });
  }
}