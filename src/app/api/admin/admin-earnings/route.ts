import { NextRequest, NextResponse } from 'next/server';
import AdminEarnings from '@/models/AdminEarnings';
import { connectToDatabase } from '@/utils/db';
import FranchiseWallet from '@/models/Wallet'; // your franchise wallet model
import ProviderWallet from '@/models/ProviderWallet'; // your provider wallet model
import mongoose from 'mongoose';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ✅ POST: Create or update AdminEarnings by date
export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const body = await req.json();
    const {
      date, // format: YYYY-MM-DD
      totalRevenue = 0,
      adminCommission = 0,
      providerEarnings = 0,
      franchiseEarnings = 0,
      refundsToUsers = 0,
      extraFees = 0,
      pendingPayouts = 0,
    } = body;

    if (!date) {
      return NextResponse.json(
        { success: false, message: 'Missing required field: date' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Upsert (update if exists, insert if not)
    const earnings = await AdminEarnings.findOneAndUpdate(
      { date },
      {
        $set: {
          totalRevenue,
          adminCommission,
          providerEarnings,
          franchiseEarnings,
          refundsToUsers,
          extraFees,
          pendingPayouts,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(
      { success: true, data: earnings },
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

// ✅ GET: Get AdminEarnings by date (?date=YYYY-MM-DD)
// export async function GET(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const { searchParams } = new URL(req.url);

//     const earnings = await AdminEarnings.findOne({  });

//     if (!earnings) {
//       return NextResponse.json(
//         { success: false, message: 'AdminEarnings not found for the given date' },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       { success: true, data: earnings },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     const message = error instanceof Error ? error.message : 'Unknown error';
//     return NextResponse.json(
//       { success: false, message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const summary = searchParams.get('summary');

    if (summary === 'true') {
      const result = await AdminEarnings.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalRevenue' },
            adminCommission: { $sum: '$adminCommission' },
            providerEarnings: { $sum: '$providerEarnings' },
            franchiseEarnings: { $sum: '$franchiseEarnings' },
            refundsToUsers: { $sum: '$refundsToUsers' },
            extraFees: { $sum: '$extraFees' },
            pendingPayouts: { $sum: '$pendingPayouts' },
          },
        },
        {
          $project: {
            _id: 0,
            totalRevenue: 1,
            adminCommission: 1,
            providerEarnings: 1,
            franchiseEarnings: 1,
            refundsToUsers: 1,
            extraFees: 1,
            pendingPayouts: 1,
          },
        },
      ]);

      
      // ✅ Get total franchise balance, excluding one franchise by _id
      const franchiseBalanceAgg = await FranchiseWallet.aggregate([
        {
          $match: {
            userId: { $ne: new mongoose.Types.ObjectId("444c44d4444be444d4444444") }
          }
        },
        {
          $group: {
            _id: null,
            totalFranchiseBalance: { $sum: "$balance" }
          }
        }
      ]);

      // ✅ Get total provider balance (no exclusion)
      const providerBalanceAgg = await ProviderWallet.aggregate([
        { $group: { _id: null, totalProviderBalance: { $sum: "$balance" } } }
      ]);

      const franchiseBalance = franchiseBalanceAgg[0]?.totalFranchiseBalance || 0;
      const providerBalance = providerBalanceAgg[0]?.totalProviderBalance || 0;

      return NextResponse.json(
        {
          success: true,
          data: {
            ...(result[0] || {}),
            franchiseBalance,
            providerBalance
          }
        },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Missing or invalid summary=true parameter' },
      { status: 400, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
