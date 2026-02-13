import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/utils/db";

import Checkout from "@/models/Checkout";
import Coupon from "@/models/Coupon";
import CouponUsage from "@/models/CouponUsage";
import Zone from "@/models/Zone";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: { lat: number; lng: number }[]
) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng,
      yi = polygon[i].lat;
    const xj = polygon[j].lng,
      yj = polygon[j].lat;

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const { searchParams, pathname } = new URL(req.url);

    const userId = pathname.split("/").pop();
    const serviceId = searchParams.get("serviceId");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    console.log("service Id : ", serviceId)
        console.log("lat : ", lat)
            console.log("lng : ", lng)

    // ✅ Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Valid userId is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    let zoneId: string | null = null;

    // ✅ Find matched zone if lat/lng provided
    if (lat && lng) {
      const allZones = await Zone.find({ isDeleted: false });
      let matchedZone: any = null;

      for (const zone of allZones) {
        if (
          !zone.isPanIndia &&
          isPointInPolygon(
            { lat: +lat, lng: +lng },
            zone.coordinates
          )
        ) {
          matchedZone = zone;
          break;
        }
      }

      if (matchedZone) {
        zoneId = matchedZone._id.toString();
      }
    }

    const now = new Date();

    // ✅ Count completed bookings
    const leadCount = await Checkout.countDocuments({
      user: userId,
      isDeleted: false,
      isCanceled: false,
    });

    // ✅ Fetch active & valid date coupons
    const coupons = await Coupon.find({
      isDeleted: false,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    const validCoupons: any[] = [];

    for (const coupon of coupons) {
      let isValid = true;

      // ✅ First booking coupon
      if (coupon.couponType === "firstBooking" && leadCount > 0) {
        isValid = false;
      }

      // ✅ Customer wise coupon
      if (
        coupon.couponType === "customerWise" &&
        (!coupon.customer ||
          coupon.customer.toString() !== userId)
      ) {
        isValid = false;
      }

      // ✅ Per user usage limit
      if (coupon.limitPerUser > 0) {
        const usage = await CouponUsage.findOne({
          coupon: coupon._id,
          user: userId,
        });

        if (usage && usage.usedCount >= coupon.limitPerUser) {
          isValid = false;
        }
      }

      // ✅ Service wise coupon
if (coupon.discountType === "Service Wise") {
  if (!serviceId) {
    isValid = false;
  }
  else if (
    !coupon.service ||
    coupon.service.toString() !== serviceId
  ) {
    isValid = false;
  }
}


// ✅ Zone wise coupon (STRICT CHECK)
if (coupon.zone) {
  if (!zoneId) {
    isValid = false;
  }
  else if (coupon.zone.toString() !== zoneId) {
    isValid = false;
  }
}


      if (isValid) {
        validCoupons.push({
          couponId: coupon._id,
          couponCode: coupon.couponCode,
          couponType: coupon.couponType,
          discountAmountType: coupon.discountAmountType,
          amount: coupon.amount,
          minPurchase: coupon.minPurchase,
          maxDiscount: coupon.maxDiscount,
          endDate: coupon.endDate,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        total: validCoupons.length,
        coupons: validCoupons,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
