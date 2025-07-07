import { Commission } from '@/models/PackagesCommission';
import { connectToDatabase } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    const commissions = await Commission.find().sort({ createdAt: -1 });
    return NextResponse.json(commissions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (
      typeof body.level1Commission !== 'number' ||
      typeof body.level2Commission !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid commission values' }, { status: 400 });
    }

    const newCommission = await Commission.create(body);
    return NextResponse.json(newCommission, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
