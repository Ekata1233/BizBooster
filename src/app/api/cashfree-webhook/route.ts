import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    console.log("✅ Webhook Received:", body);

    // ✅ Destructure from nested data
    const {
      order: { order_id, order_amount, order_currency },
      payment: {
        cf_payment_id,
        payment_status,
        payment_amount,
        payment_currency,
        payment_time,
        bank_reference,
        payment_group,
      },
      customer_details,
    } = body.data;

    if (!order_id || !payment_status) {
      return NextResponse.json({ error: "Missing order_id or payment_status" }, { status: 400, headers: corsHeaders });
    }

    // ✅ Update or create the payment record in your DB
    const updated = await Payment.findOneAndUpdate(
      { order_id },
      {
        payment_id: cf_payment_id,
        amount: payment_amount,
        currency: payment_currency,
        status: payment_status,
        name: customer_details?.customer_name,
        email: customer_details?.customer_email,
        phone: customer_details?.customer_phone,
        payment_method: payment_group,

      },
      { upsert: true, new: true }
    );

    const checkoutId = body?.data?.order?.order_tags?.checkoutId;

    if (payment_status === "SUCCESS" && checkoutId) {
      const updatedCheckout = await Checkout.findOneAndUpdate(
        { checkoutId },
        {
          paymentMethod: [payment_group],
          paymentStatus: "paid",
        },
        { new: true }
      );

      if (updatedCheckout) {
        console.log(`✅ Updated Checkout for bookingId: ${checkoutId}`);
      } else {
        console.warn(`⚠️ No Checkout found for bookingId: ${checkoutId}`);
      }}

      console.log(`📦 Payment ${payment_status} for order: ${order_id}`);

      return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error: any) {
      console.error("❌ Webhook Error:", error.message);
      return NextResponse.json({ error: "Webhook processing failed" }, { status: 500, headers: corsHeaders });
    }
  }
