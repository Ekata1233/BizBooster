import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import '@/models/Coupon';
import CouponUsage from '@/models/CouponUsage';

export async function GET(req: NextRequest) {
    await connectToDatabase();
    try {
        const url = new URL(req.url);
        const userId = url.pathname.split("/").pop();

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // ✅ Find coupon usages for this user
        const usedCoupons = await CouponUsage.find({ user: userId })
            .populate('coupon') // populate coupon details
            .lean();

        // If no coupons used
        if (!usedCoupons || usedCoupons.length === 0) {
            return NextResponse.json({ success: true, data: [] });
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

        return NextResponse.json({ success: true, data: result });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
