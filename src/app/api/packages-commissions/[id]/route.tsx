import { PackagesCommission } from '@/models/PackagesCommission';
import { connectToDatabase } from '@/utils/db';
import { NextResponse } from 'next/server';


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (
      typeof body.level1Commission !== 'number' ||
      typeof body.level2Commission !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid commission values' }, { status: 400 });
    }

    const updated = await PackagesCommission.findByIdAndUpdate(params.id, body, { new: true });

    if (!updated) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const deleted = await PackagesCommission.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Commission deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
