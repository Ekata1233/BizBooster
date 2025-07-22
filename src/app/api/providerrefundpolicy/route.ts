import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import ProviderRefundPolicy from '@/models/ProviderRefundPolicy';
import mongoose from 'mongoose';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// GET all provider privacy policies
export async function GET() {
  await connectToDatabase();

  try {
    const policies = await ProviderRefundPolicy.find().populate({
      path: 'module',
      select: 'name image', // Cleaned up spacing
    });

    return NextResponse.json(
      { success: true, data: policies },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message?: string }).message
        : 'Failed to fetch policies';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}



export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const body = await req.json();
    const moduleId = (body?.module ?? '').toString().trim();
    const content = (body?.content ?? '').toString();

    if (!moduleId || !content) {
      return NextResponse.json(
        { success: false, message: 'Module and content are required.' },
        { status: 400, headers: corsHeaders },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid module ID.' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Does an entry already exist for this module?
    const existing = await ProviderRefundPolicy.findOne({ module: moduleId });

    if (existing) {
      existing.content = content;
      await existing.save();
      return NextResponse.json(
        {
          success: true,
          data: existing,
          message: 'Provider Refund Policy content replaced successfully.',
        },
        { status: 200, headers: corsHeaders },
      );
    }

    // Create new
    const created = await ProviderRefundPolicy.create({ module: moduleId, content });
    return NextResponse.json(
      {
        success: true,
        data: created,
        message: 'Provider Refund Policy content created successfully.',
      },
      { status: 201, headers: corsHeaders },
    );
  } catch (error: unknown) {
    console.error('POST /api/providercancellationpolicy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}