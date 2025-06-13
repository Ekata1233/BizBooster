import { NextRequest, NextResponse } from 'next/server';
import Checkout from '@/models/Checkout';
import { connectToDatabase } from '@/utils/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ✅ POST: Create a new Checkout
export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const body = await req.json();
    const {
      user,
      service,
      serviceCustomer,
      provider,
      coupon,
      subtotal,
      serviceDiscount,
      couponDiscount,
      champaignDiscount = 0,
      vat = 0,
      platformFee = 0,
      garrentyFee,
      tax = 0,
      totalAmount,
      paymentMethod,
      paymentStatus = 'pending',
      orderStatus = 'processing',
      notes = '',
    } = body;

    if (!user || !service || !serviceCustomer || !totalAmount || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const newCheckout = await Checkout.create({
      user,
      service,
      serviceCustomer,
      provider,
      coupon,
      subtotal,
      serviceDiscount,
      couponDiscount,
      champaignDiscount,
      vat,
      platformFee,
      garrentyFee,
      tax,
      totalAmount,
      paymentMethod,
      paymentStatus,
      orderStatus,
      notes,
    });

    return NextResponse.json(
      { success: true, data: newCheckout },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ GET: Get all Checkout entries (with optional filters)
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user');
    const status = searchParams.get('status');

    const filter: any = {};

    if (user) filter.user = user;
    if (status) filter.orderStatus = status;

    const checkouts = await Checkout.find(filter)
      .populate('user')
      .populate('service')
      .populate('serviceCustomer')
      .populate('provider')
      .populate('coupon')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: checkouts },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
