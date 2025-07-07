import { PackagesCommission } from '@/models/PackagesCommission';
import { connectToDatabase } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    const commission = await PackagesCommission.findOne().sort({ createdAt: -1 });
    return NextResponse.json(commission || {});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { level1Commission, level2Commission } = body;

    // Validate input
    if (typeof level1Commission !== 'number' || typeof level2Commission !== 'number') {
      return NextResponse.json({ error: 'Invalid commission values' }, { status: 400 });
    }

    // Check if commission document exists
    const existingCommission = await PackagesCommission.findOne();

    let result;
    if (existingCommission) {
      // Update the existing commission
      existingCommission.level1Commission = level1Commission;
      existingCommission.level2Commission = level2Commission;
      await existingCommission.save();
      result = existingCommission;
    } else {
      // Create new commission only once
      result = await PackagesCommission.create({
        level1Commission,
        level2Commission,
      });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
