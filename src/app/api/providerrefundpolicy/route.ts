import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import ProviderRefundPolicy from '@/models/ProviderRefundPolicy';

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

// POST a new provider privacy policy
export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const { module, content }: { module: string; content: string } = await req.json();

    if (!module || !content) {
      return NextResponse.json(
        { success: false, message: 'Module and content are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const newPolicy = await ProviderRefundPolicy.create({ module, content });

    return NextResponse.json(
      { success: true, data: newPolicy },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message?: string }).message
        : 'Failed to create policy';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// OPTIONAL: Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
