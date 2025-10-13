import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import '@/models/Coupon';
import CouponUsage from '@/models/CouponUsage';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    await connectToDatabase();
    try {
        const url = new URL(req.url);
        const userId = url.pathname.split("/").pop();

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId' }, 
                { status: 400, headers: corsHeaders }
            );
        }

        // ✅ Find coupon usages for this user
        const usedCoupons = await CouponUsage.find({ user: userId })
            .populate('coupon') // populate coupon details
            .lean();

        // If no coupons used
        if (!usedCoupons || usedCoupons.length === 0) {
            return NextResponse.json(
                { success: true, message: 'No coupons used by this user.' },
                { headers: corsHeaders }
            );
        }

        // ✅ Format response
        const result = usedCoupons.map((usage) => ({
            couponId: usage.coupon?._id,
            couponCode: usage.coupon?.couponCode,
            couponTitle: usage.coupon?.discountTitle,
            discountType: usage.coupon?.discountAmountType,
            amount: usage.coupon?.amount,
            usedCount: usage.usedCount,
            limitPerUser: usage.coupon?.limitPerUser,
            startDate: usage.coupon?.startDate,
            endDate: usage.coupon?.endDate,
        }));

        return NextResponse.json({ success: true, data: result }, { headers: corsHeaders });
    } catch (err: any) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500, headers: corsHeaders }
        );
    }
}
