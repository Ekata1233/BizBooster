import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import ProviderCancellationPolicy from '@/models/ProviderCancellationPolicy';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// GET single policy by ID
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  try {
    const policy = await ProviderCancellationPolicy.findById(params.id).populate('module');

    if (!policy) {
      return NextResponse.json({ success: false, message: 'Policy not found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, data: policy }, { status: 200, headers: corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT (update) a policy
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  try {
    const { module, content } = await req.json();

    const updated = await ProviderCancellationPolicy.findByIdAndUpdate(
      params.id,
      { module, content },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Policy not found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200, headers: corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE a policy
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  try {
    const deleted = await ProviderCancellationPolicy.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Policy not found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, message: 'Policy deleted successfully' }, { status: 200, headers: corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
