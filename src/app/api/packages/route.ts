// /app/api/packages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import { Package } from '@/models/Package';

export async function GET() {
  try {
    await connectToDatabase();
    const packages = await Package.find().sort({ createdAt: -1 });
    return NextResponse.json(packages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { description, price, discount, discountedPrice, deposit } = body;

    const newPackage = new Package({ description, price, discount, discountedPrice, deposit });
    await newPackage.save();

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
