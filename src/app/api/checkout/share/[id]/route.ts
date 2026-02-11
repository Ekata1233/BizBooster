import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/utils/db';
import UpcomingCommission from '@/models/UpcomingCommission';

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

    console.log("checkout id:", id);

    // ✅ Validate checkout ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Valid checkout ID is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Find CommissionPreview by checkoutId
    const commission = await UpcomingCommission.findOne({
      checkoutId: id,
    }).select(
      'share_1 share_2 share_3 admin_commission provider_share extra_share_1 extra_share_2 extra_share_3 extra_admin_commission extra_provider_share'
    );

    if (!commission) {
      return NextResponse.json(
        { success: false, message: 'Commission data not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: commission },
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
