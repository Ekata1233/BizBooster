// app/api/apply-coupon/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Coupon from '@/models/Coupon';
import { Types } from 'mongoose';
import { connectToDatabase } from '@/utils/db';
import CouponUsage from '@/models/CouponUsage';

export async function POST(req: NextRequest) {
    await connectToDatabase();
    try {
        const body = await req.json();
        const { couponCode, userId, leadCount, purchaseAmount, serviceId, zoneId } = body;

        if (!couponCode || !userId || purchaseAmount == null) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const now = new Date();
        const coupon = await Coupon.findOne({ couponCode: couponCode.toUpperCase(), isDeleted: false, isActive: true });

        if (!coupon) return NextResponse.json({ error: 'Invalid coupon' }, { status: 400 });

        // Expiration
        if (coupon.startDate > now || coupon.endDate < now) {
            return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
        }

        // Coupon type checks
        if (coupon.couponType === 'firstBooking' && leadCount > 0) {
            return NextResponse.json({ error: 'This coupon is only for first booking' }, { status: 400 });
        }

        if (coupon.couponType === 'customerWise' && (!coupon.customer || coupon.customer.toString() !== userId)) {
            return NextResponse.json({ error: 'This coupon is not for you' }, { status: 400 });
        }

        if (coupon.limitPerUser > 0) {
            const usage = await CouponUsage.findOne({ coupon: coupon._id, user: userId });
            if (usage && usage.usedCount >= coupon.limitPerUser) {
                return NextResponse.json({ error: 'You have already used this coupon the maximum number of times' }, { status: 400 });
            }
        }

        // Minimum purchase
        if (purchaseAmount < coupon.minPurchase) {
            return NextResponse.json({ error: `Minimum purchase ${coupon.minPurchase}Rs required` }, { status: 400 });
        }

        if (coupon.discountType === 'Service Wise' && coupon.service.toString() !== serviceId) {
            return NextResponse.json({ error: 'Coupon not valid for this service' }, { status: 400 });
        }

        if (coupon.zone.toString() !== zoneId) {
            return NextResponse.json({ error: 'Coupon not valid in this zone' }, { status: 400 });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountAmountType === 'Percentage') {
            discount = (purchaseAmount * coupon.amount) / 100;
            if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
        } else {
            discount = coupon.amount;
        }

        if (coupon.limitPerUser > 0) {
            await CouponUsage.findOneAndUpdate(
                { coupon: coupon._id, user: userId },
                { $inc: { usedCount: 1 } },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json({ success: true, data: { couponId: coupon._id, discount } });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}
