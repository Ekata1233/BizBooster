import { NextRequest, NextResponse } from 'next/server';
import Checkout from '@/models/Checkout';
import { connectToDatabase } from '@/utils/db';

import "@/models/Coupon";
import "@/models/Service";
import "@/models/ServiceCustomer";
import "@/models/User";
import "@/models/Provider";
import mongoose from 'mongoose';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  await connectToDatabase();

  try {

    const url = new URL(req.url);
    console.log("url : ", url)
    const id = url.pathname.split("/").pop();

    console.log("id:", id);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Valid provider ID is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const checkouts = await Checkout.find({ provider: new mongoose.Types.ObjectId(id) })
    .populate({ path: 'serviceCustomer', select: 'fullName email city' })
    .populate({ path: 'service', select: 'serviceName price discount discountedPrice franchiseDetails.commission' });

    return NextResponse.json(
      { success: true, data: checkouts },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch data' },
      { status: 500, headers: corsHeaders }
    );
  }
}


// ✅ PUT: Update a specific checkout (partial updates allowed)
export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    const body = await req.json();

    console.log("update data of checkout : ", body)

    const updatedCheckout = await Checkout.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCheckout) {
      return NextResponse.json(
        { success: false, message: 'Checkout not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedCheckout },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ DELETE: Delete a specific checkout by ID
export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    const deleted = await Checkout.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Checkout not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Checkout deleted successfully.' },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

