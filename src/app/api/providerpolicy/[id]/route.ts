import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import ProviderPolicy from '@/models/ProviderPolicy';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// GET single policy by ID
export async function GET(req: NextRequest) {
  await connectToDatabase();
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const policy = await ProviderPolicy.findById(id).populate('module');

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
export async function PUT(req: NextRequest) {
  await connectToDatabase();
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const { module, content } = await req.json();

    const updated = await ProviderPolicy.findByIdAndUpdate(
      id,
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
export async function DELETE(req: NextRequest) {
  await connectToDatabase();
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const deleted = await ProviderPolicy.findByIdAndDelete(id);

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
