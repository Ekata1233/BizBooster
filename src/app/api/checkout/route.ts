import { NextRequest, NextResponse } from 'next/server';
import Checkout from '@/models/Checkout';
import { connectToDatabase } from '@/utils/db';
import "@/models/Coupon"
import "@/models/Service"
import "@/models/ServiceCustomer"
import "@/models/User"
import "@/models/Provider"

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
    console.log("Body of the checkout : ", body);
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
      termsCondition = false,
      paymentMethod,
      walletAmount = 0,
      paidByOtherMethodAmount = 0,
      partialPaymentNow = 0,
      partialPaymentLater = 0,
      remainingPaymentStatus, 
      paymentStatus ,
      orderStatus ,
      notes = '',
    } = body;

    const requiredFields = {
      user,
      service,
      serviceCustomer,
      totalAmount,
      paymentMethod,
      provider
    };

    if (!termsCondition) {
      return NextResponse.json(
        { success: false, message: 'You must agree to the terms and conditions to proceed.' },
        { status: 400, headers: corsHeaders }
      );
    }


    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return NextResponse.json(
          { success: false, message: `Missing ${field} field.` },
          { status: 400, headers: corsHeaders }
        );
      }
    }


    const checkout = new Checkout({
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
      termsCondition,
      paymentMethod,
      walletAmount,
      paidByOtherMethodAmount,
      partialPaymentNow,
      partialPaymentLater,
      remainingPaymentStatus,
      paymentStatus,
      orderStatus,
      notes,
    });

    console.log("checkout before save: ", checkout)

    await checkout.save();

    return NextResponse.json(
      { success: true, data: checkout },
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
      .populate({ path: 'user', select: 'fullName email mobileNumber' })
      .populate({ path: 'service', select: 'serviceName price discountedPrice' })
      .populate({ path: 'serviceCustomer', select: 'fullName email city' }).populate('provider')
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
