// /app/api/packages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import { Package } from '@/models/Package';

export async function GET() {
  try {
    await connectToDatabase();
    const latestPackage = await Package.findOne().sort({ createdAt: -1 });
    return NextResponse.json(latestPackage || {});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  try {
    const body = await req.json();

    if (
      !body.description?.gp ||
      typeof body.price !== 'number' ||
      typeof body.discount !== 'number' ||
      typeof body.discountedPrice !== 'number' ||
      typeof body.deposit !== 'number' ||
           typeof body.monthlyEarnings !== 'number' || 
      typeof body.lockInPeriod !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const discountedPrice = Number(body.discountedPrice);
const deposit = Number(body.deposit);
const grandtotal = discountedPrice + deposit;

const newPackage = new Package({
  price: body.price,
  discount: body.discount,
  discountedPrice,
  deposit,
  grandtotal, // ✅ will save correctly
  description: {
    gp: body.description.gp,
    sgp: body.description.sgp || '',
    pgp: body.description.pgp || '',
  },
  monthlyEarnings: body.monthlyEarnings,
  lockInPeriod: body.lockInPeriod,
});


    await newPackage.save();

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    console.error('POST /api/packages error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

