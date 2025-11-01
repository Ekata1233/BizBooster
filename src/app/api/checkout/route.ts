import { NextRequest, NextResponse } from 'next/server';
import Checkout from '@/models/Checkout';
import { connectToDatabase } from '@/utils/db';
import "@/models/Coupon"
import "@/models/Service"
import "@/models/ServiceCustomer"
import "@/models/User"
import "@/models/Provider"
import "@/models/CouponUsage"
import Coupon from '@/models/Coupon';
import CouponUsage from '@/models/CouponUsage';

const allowedOrigins = [
  'http://localhost:5173',
  'https://fetchtrue-service-page.vercel.app',
  'https://api.fetchtrue.com',
  '*', // ⚠️ Only if you want to allow all (use with caution!)
];

// Get CORS headers dynamically based on origin
function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (allowedOrigins.includes('*')) {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

// Handle OPTIONS request (preflight)
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}



export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  await connectToDatabase();

  try {
    const body = await req.json();
    console.log("Body of the checkout:", body);

    const {
      user,
      service,
      serviceCustomer,
      provider,
      serviceMan,
      coupon,

      subtotal,
      serviceDiscount,
      couponDiscount,
      couponDiscountType,
      champaignDiscount,
      gst,
      platformFee,
      assurityfee,

      listingPrice,
      serviceDiscountPrice,
      priceAfterDiscount,
      couponDiscountPrice,
      serviceGSTPrice,
      platformFeePrice,
      assurityChargesPrice,

      commission,

      totalAmount,

      termsCondition,
      paymentMethod,
      walletAmount,
      otherAmount,
      paidAmount,
      remainingAmount,
      isPartialPayment,

      paymentStatus,
      orderStatus,
      notes,
    } = body;

    // Required field validation
    const requiredFields = {
      user,
      service,
      serviceCustomer,
      totalAmount,
      paymentMethod,
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

    // if (coupon) {
    //   const couponDoc = await Coupon.findById(coupon);

    //   if (!couponDoc) {
    //     return NextResponse.json(
    //       { success: false, message: "Invalid coupon." },
    //       { status: 400, headers: corsHeaders }
    //     );
    //   }

    //   if (!couponDoc.isActive) {
    //     return NextResponse.json(
    //       { success: false, message: "Coupon expired or not valid." },
    //       { status: 400, headers: corsHeaders }
    //     );
    //   }
    // }

     let validCouponDoc = null;
    if (coupon) {
      const couponDoc = await Coupon.findById(coupon);
      if (!couponDoc) {
        return NextResponse.json({ success: false, message: "Invalid coupon." }, { status: 400, headers: corsHeaders });
      }
      if (!couponDoc.isActive || couponDoc.isDeleted) {
        return NextResponse.json({ success: false, message: "Coupon expired or not valid." }, { status: 400, headers: corsHeaders });
      }
      validCouponDoc = couponDoc;
    }

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30 in milliseconds
    const istTime = new Date(now.getTime() + istOffset);

    const checkout = new Checkout({
      user,
      service,
      serviceCustomer,
      provider,
      serviceMan,
      coupon,

      subtotal,
      serviceDiscount,
      couponDiscount,
      couponDiscountType,
      champaignDiscount,
      gst,
      platformFee,
      assurityfee,

      listingPrice,
      serviceDiscountPrice,
      priceAfterDiscount,
      couponDiscountPrice,
      serviceGSTPrice,
      platformFeePrice,
      assurityChargesPrice,

      commission,

      totalAmount,

      termsCondition,
      paymentMethod,
      walletAmount,
      otherAmount,
      paidAmount,
      remainingAmount,
      isPartialPayment,

      paymentStatus,
      orderStatus,
      notes,
      createdAt: istTime,
      updatedAt: istTime,
    });

    console.log('Checkout before save:', checkout);

    await checkout.save();

    console.log("valid coupon : ", validCouponDoc);

     if (validCouponDoc) {
      await CouponUsage.findOneAndUpdate(
        { coupon: validCouponDoc._id, user },
        { $inc: { usedCount: 1 } },
        { upsert: true, new: true }
      );
    }

    // return NextResponse.json(
    //   { success: true, data: checkout },
    //   { status: 201, headers: corsHeaders }
    // );
    return new NextResponse(JSON.stringify({ success: true, data: checkout }), {
      status: 201,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

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
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
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
      .populate({ path: 'service', select: 'serviceName price discount discountedPrice franchiseDetails.commission' })
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
