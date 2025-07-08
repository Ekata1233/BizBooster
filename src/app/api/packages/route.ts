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
  try {
    await connectToDatabase();
    const body = await req.json();
    const { description, price, discount, discountedPrice, deposit } = body;

    // Input validation
    if (
      typeof description !== 'string' ||
      typeof price !== 'number' ||
      typeof discount !== 'number' ||
      typeof discountedPrice !== 'number' ||
      typeof deposit !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Check if a package already exists
    const existingPackage = await Package.findOne();

    let result;
    if (existingPackage) {
      // Update existing package
      existingPackage.description = description;
      existingPackage.price = price;
      existingPackage.discount = discount;
      existingPackage.discountedPrice = discountedPrice;
      existingPackage.deposit = deposit;

      await existingPackage.save();
      result = existingPackage;
    } else {
      // Create new package
      result = await Package.create({
        description,
        price,
        discount,
        discountedPrice,
        deposit,
      });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
