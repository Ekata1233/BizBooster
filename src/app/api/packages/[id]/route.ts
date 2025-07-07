// /app/api/packages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import { Package } from '@/models/Package';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const updatedPackage = await Package.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json(updatedPackage);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    await Package.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Package deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
