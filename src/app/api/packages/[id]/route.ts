// /app/api/packages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import { Package } from '@/models/Package';

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const body = await req.json();

    // ✅ Ensure discountedPrice and deposit are numbers before calculating
    const discountedPrice = Number(body.discountedPrice) || 0;
    const deposit = Number(body.deposit) || 0;

    const grandtotal = discountedPrice + deposit;

    const updated = await Package.findByIdAndUpdate(
      id,
      {
        ...body,
        grandtotal, // ✅ Reassign here
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
