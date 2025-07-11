import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Payment from "@/models/Payment";

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

    const {
      link_id,
      link_status,
      payment_id,
      payment_amount,
      payment_currency,
      customer_details,
    } = body;

    if (!link_id || !link_status) {
      return NextResponse.json({ error: "Missing link data" }, { status: 400, headers: corsHeaders });
    }

    // ✅ Update or Insert payment record in DB
    const updated = await Payment.findOneAndUpdate(
      { link_id },
      {
        status: link_status,
        payment_id,
        amount: payment_amount,
        currency: payment_currency,
        customer_id: customer_details?.customer_id,
        customer_name: customer_details?.customer_name,
        customer_email: customer_details?.customer_email,
        customer_phone: customer_details?.customer_phone,
      },
      { upsert: true, new: true } // Creates if not found
    );

    if (link_status === "PAID") {
      console.log(`✅ Payment successful for link: ${link_id}`);
    } else if (link_status === "EXPIRED" || link_status === "CANCELLED") {
      console.log(`❌ Payment failed or cancelled for link: ${link_id}`);
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("❌ Webhook Error:", error.message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500, headers: corsHeaders });
  }
}
