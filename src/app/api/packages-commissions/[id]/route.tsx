import { PackagesCommission } from '@/models/PackagesCommission';
import { connectToDatabase } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'Missing ID in URL' }, { status: 400 });
  }

  try {
    const body = await req.json();

    if (
      typeof body.level1Commission !== 'number' ||
      typeof body.level2Commission !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid commission values' }, { status: 400 });
    }

    const updated = await PackagesCommission.findByIdAndUpdate(id, body, { new: true });

    if (!updated) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'Missing ID in URL' }, { status: 400 });
  }

  try {
    const deleted = await PackagesCommission.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Commission deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
