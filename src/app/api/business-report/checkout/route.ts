// src/app/api/commission-preview/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/utils/db";
import Checkout from "@/models/Checkout";
import UpcomingCommission from "@/models/UpcomingCommission";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/commission-preview?page=1&limit=10
 * Fetches combined Checkout and CommissionPreview data with pagination
 */
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // ✅ Get pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // ✅ Get total count (for frontend pagination)
    const totalCount = await UpcomingCommission.countDocuments();

    // Fetch all checkout entries with corresponding commission preview
    const data = await UpcomingCommission.aggregate([
      {
        $lookup: {
          from: "checkouts",
          localField: "checkoutId",
          foreignField: "_id",
          as: "checkout",
        },
      },
      { $unwind: { path: "$checkout", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          leadId: 1,
          checkoutId: 1,

          // From Checkout
          bookingId: "$checkout.bookingId",
          priceAfterDiscount: "$checkout.priceAfterDiscount",
          couponDiscountPrice: "$checkout.couponDiscountPrice",
          serviceGSTPrice: "$checkout.serviceGSTPrice",
          platformFeePrice: "$checkout.platformFeePrice",
          assurityChargesPrice: "$checkout.assurityChargesPrice",

          // Conditional grand total (if > 0 else totalAmount)
          totalAmount: {
            $cond: {
              if: { $gt: ["$checkout.grandTotal", 0] },
              then: "$checkout.grandTotal",
              else: "$checkout.totalAmount",
            },
          },

          // From CommissionPreview
          share_1: 1,
          share_2: 1,
          share_3: 1,
          admin_commission: 1,
          provider_share: 1,
          extra_share_1: 1,
          extra_share_2: 1,
          extra_share_3: 1,
          extra_admin_commission: 1,
          extra_provider_share: 1,

          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return NextResponse.json(
      {
        success: true,
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        data,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("GET /api/commission-preview error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
