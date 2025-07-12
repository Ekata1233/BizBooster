import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import ProviderAboutUs from '@/models/ProviderAboutUs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// GET
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const policy = await ProviderAboutUs.findById(id).populate('module');

    if (!policy) {
      return NextResponse.json({ success: false, message: 'Policy not found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, data: policy }, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const body = await req.json();

    const updated = await ProviderAboutUs.findByIdAndUpdate(id, body, { new: true });

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Policy not found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const deleted = await ProviderAboutUs.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Policy not found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, message: 'Policy deleted successfully' }, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
