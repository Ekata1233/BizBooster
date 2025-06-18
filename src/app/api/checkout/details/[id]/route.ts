import {NextResponse } from 'next/server';
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
    const id = url.pathname.split("/").pop();

    console.log("id:", id);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Valid checkout ID is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const checkout = await Checkout.findById(id);

    if (!checkout) {
      return NextResponse.json(
        { success: false, message: 'Checkout not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: checkout },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch data' },
      { status: 500, headers: corsHeaders }
    );
  }
}



