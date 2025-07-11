import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import ProviderCancellationPolicy from '@/models/ProviderCancellationPolicy';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// GET all provider policies
export async function GET() {
  await connectToDatabase();
  try {
    const policies = await ProviderCancellationPolicy.find({}).populate('module');
    return NextResponse.json({ success: true, data: policies }, { status: 200, headers: corsHeaders });
  } catch (error: unknown) {
    const errorMessage = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST new provider policy
export async function POST(req: NextRequest) {
  await connectToDatabase();
  try {
    const { module, content } = await req.json();

    if (!module || !content) {
      return NextResponse.json(
        { success: false, message: 'Module and content are required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const newPolicy = await ProviderCancellationPolicy.create({ module, content });

    return NextResponse.json(
      { success: true, data: newPolicy },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const errorMessage = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500, headers: corsHeaders }
    );
  }
}
