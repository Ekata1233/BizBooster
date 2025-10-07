// // src/app/api/offer/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import mongoose from 'mongoose';
// import { connectToDatabase } from '@/utils/db';
// import imagekit from '@/utils/imagekit';
// import Offer from '@/models/Offer';

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
// };

// export function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }


// export async function GET() {
//   try {
//     await connectToDatabase();

//     const now = new Date();

//     // 1️⃣ Set isActive = false for expired offers
//     await Offer.updateMany(
//       { offerEndTime: { $lt: now }, isActive: true },
//       { $set: { isActive: false } }
//     );

//     // 2️⃣ Set isActive = true for currently active offers
//     await Offer.updateMany(
//       { offerStartTime: { $lte: now }, offerEndTime: { $gte: now }, isActive: false },
//       { $set: { isActive: true } }
//     );

//     const offers = await Offer.find().populate({
//       path: 'service',
//       select: 'serviceName name _id', // adapt to your Service schema
//     }).sort({ createdAt: -1 });

//     return NextResponse.json(
//       { success: true, data: offers },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error) {
//     console.error('GET /api/offer error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Internal Server Error' },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


// src/app/api/offer/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Offer from '@/models/Offer';
import '@/models/Service';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight requests
export function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    // 1️⃣ Connect to DB
    await connectToDatabase();

    const now = new Date();

    // 2️⃣ Update expired offers
    try {
      const resExpired = await Offer.updateMany(
        { offerEndTime: { $lt: now }, isActive: true },
        { $set: { isActive: false } }
      );
      console.log('Expired offers updated:', resExpired.modifiedCount);
    } catch (e) {
      console.error('Error updating expired offers:', e);
    }

    // 3️⃣ Update currently active offers
    try {
      const resActive = await Offer.updateMany(
        { offerStartTime: { $lte: now }, offerEndTime: { $gte: now }, isActive: false },
        { $set: { isActive: true } }
      );
      console.log('Active offers updated:', resActive.modifiedCount);
    } catch (e) {
      console.error('Error updating active offers:', e);
    }

    // 4️⃣ Fetch offers
    let offers;
    try {
      offers = await Offer.find()
        .populate({
          path: 'service',
          select: 'serviceName name _id', // adjust according to your Service schema
        })
        .sort({ createdAt: -1 })
        .lean(); // lean() makes plain JS objects, faster & safer for Next.js
    } catch (e) {
      console.error('Error fetching offers:', e);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch offers' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: offers },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('GET /api/offer error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
