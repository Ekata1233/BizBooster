import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import { Package } from '@/models/Package';



export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    // Extract the ID from the URL path
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop(); // Assumes the ID is at the end

    const body = await req.json();

    const updated = await Package.findByIdAndUpdate(id, body, { new: true });

    if (!updated) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

