import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Coupon from "@/models/Coupon";
import "@/models/Category";
import "@/models/Service";
import "@/models/Zone";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}


export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    console.log("formdata of the coupon : ", formData);

    /* ── extract & coerce form values ───────────────── */
    const couponType          = formData.get("couponType") as string;          // enum
    const couponCode          = (formData.get("couponCode") as string)?.trim();
    const customer            = formData.get("customer") as string | null;
    const discountType        = formData.get("discountType") as string;        // enum
    const discountTitle       = formData.get("discountTitle") as string;
    const category            = formData.get("category") as string | null;
    const service             = formData.get("service") as string | null;
    const zone                = formData.get("zone") as string;
    const discountAmountType  = formData.get("discountAmountType") as string;  // enum
    const amount              = Number(formData.get("amount"));
    const maxDiscountRaw      = formData.get("maxDiscount");
    const maxDiscount         = maxDiscountRaw ? Number(maxDiscountRaw) : undefined;
    const minPurchase         = Number(formData.get("minPurchase"));
    const startDate           = new Date(formData.get("startDate") as string);
    const endDate             = new Date(formData.get("endDate") as string);
    const limitPerUser        = Number(formData.get("limitPerUser"));
    const discountCostBearer  = formData.get("discountCostBearer") as string;  // enum
    const couponAppliesTo     = formData.get("couponAppliesTo") as string;     // enum

    /* ── basic validation ───────────────────────────── */
    if (
      !couponType       || !couponCode     || !discountType   || !discountTitle ||
      !zone             || !discountAmountType               ||
      isNaN(amount)     || isNaN(minPurchase) || isNaN(limitPerUser) ||
      !startDate || !endDate
    ) {
      return NextResponse.json(
        { success: false, message: "All required fields must be filled." },
        { status: 400, headers: corsHeaders }
      );
    }

    // percentage coupons need a maxDiscount cap
    if (discountAmountType === "Percentage" && (maxDiscount == null || isNaN(maxDiscount))) {
      return NextResponse.json(
        { success: false, message: "maxDiscount is required for percentage coupons." },
        { status: 400, headers: corsHeaders }
      );
    }

    // basic date sanity
    if (startDate >= endDate) {
      return NextResponse.json(
        { success: false, message: "endDate must be later than startDate." },
        { status: 400, headers: corsHeaders }
      );
    }

    /* ── create document ────────────────────────────── */
    const newCoupon = await Coupon.create({
      couponType,
      couponCode,
      customer:   customer  || undefined,
      discountType,
      discountTitle,
      category:   category  || undefined,
      service:    service   || undefined,
      zone,
      discountAmountType,
      amount,
      maxDiscount,
      minPurchase,
      startDate,
      endDate,
      limitPerUser,
      discountCostBearer,
      couponAppliesTo,
    });

    return NextResponse.json(
      { success: true, data: newCoupon },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 400, headers: corsHeaders }
    );
  }
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const search  = searchParams.get("search");
    const active  = searchParams.get("active"); // "true" | "false" | null

    /* ── build filter object ────────────────────────── */
    const filter: Record<string, unknown> = { };

    if (search) {
      const regex = { $regex: search, $options: "i" };
      filter.$or = [{ couponCode: regex }, { discountTitle: regex }];
    }

    if (active === "true") {
      const now = new Date();
      filter.startDate = { $lte: now };
      filter.endDate   = { $gte: now };
      filter.isActive  = true;
    } else if (active === "false") {
      filter.$or = [
        { isActive: false },
        { endDate: { $lt: new Date() } },
      ];
    }

    const coupons = await Coupon
      .find(filter)
      .populate("category", "name")
      .populate("service", "serviceName")
      .populate("zone", "name")
      .sort();

    return NextResponse.json(
      { success: true, data: coupons },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// export async function GET(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const { searchParams } = new URL(req.url);
//     const search = searchParams.get("search");
//     const active = searchParams.get("active"); // "true" | "false" | null

//     /* ── build filter object ────────────────────────── */
//     const filter: Record<string, unknown> = {  };

//     if (search) {
//       const regex = { $regex: search, $options: "i" };
//       filter.$or = [{ couponCode: regex }, { discountTitle: regex }];
//     }

//     if (active === "true") {
//       // Only check for isActive, remove date checks
//       filter.isActive = true;
//     } else if (active === "false") {
//       filter.$or = [
//         { isActive: false },
//         { endDate: { $lt: new Date() } }, // optional: remove this too if you want no date logic
//       ];
//     }

//     const coupons = await Coupon
//       .find(filter)
//       .populate("category", "name")
//       .populate("service", "serviceName")
//       .populate("zone", "name")
//       .sort();

//     return NextResponse.json(
//       { success: true, data: coupons },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json(
//       { success: false, message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }
