// /src/app/api/service/[id]/approve/route.ts   ⟵ adjust path to your folder layout
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import Service  from '@/models/Service';
import Provider from '@/models/Provider';    // ⬅️  make sure this model exists
import { connectToDatabase } from '@/utils/db';

// ❗ keep these side-effect imports if the rest of your project relies on them
import '@/models/Category';
import '@/models/Subcategory';
import '@/models/WhyChoose';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}


export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url        = new URL(req.url);
    const segments   = url.pathname.split('/');
    const id  = segments.at(-2) ?? segments.at(-1); // works for .../<id>/approve *or* .../approve/<id>
    const { providerId } = await req.json();

    if (!id || !providerId) {
      return NextResponse.json(
        { success: false, message: 'serviceId or providerId missing.' },
        { status: 400, headers: corsHeaders },
      );
    }

    /* ---------------------------------- */
    /* 2. Start a Mongo transaction       */
    /* ---------------------------------- */
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      /* 2-a. Update Service doc */
      const serviceRes = await Service.updateOne(
        { _id: id, 'providerPrices.provider': providerId },
        { $set: { 'providerPrices.$.status': 'approved' } },
        { session },
      );

      if (serviceRes.matchedCount === 0) {
        throw new Error('Service / provider pair not found.');
      }

      /* 2-b. Update Provider doc */
      await Provider.updateOne(
        { _id: providerId },
        { $addToSet: { subscribedServices: id } },
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return NextResponse.json(
        { success: true, message: 'Approval successful.' },
        { status: 200, headers: corsHeaders },
      );
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders },
    );
  }
}
