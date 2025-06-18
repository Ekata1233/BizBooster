import { NextRequest, NextResponse } from "next/server";
import { createCashfreeOrder } from "@/utils/cashfree"; // Make sure this returns { order_id, payment_session_id, order_status }
import Payment from "@/models/Payment";
import { connectToDatabase } from "@/utils/db";

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
    const body = await req.json();
    await connectToDatabase();

    const { amount, name, email, phone, user } = body;

    // ✅ Step 1: Validate input
    if (!amount || !name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: amount, name, email, phone" },
        { status: 400, headers: corsHeaders }
      );
    }

    const orderId = `order_${Date.now()}`;

    // ✅ Step 2: Create Cashfree Order
    const orderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: user ,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
      },
      order_note: "Next.js Cashfree Payment",
      order_meta: {
        return_url: `http://localhost:3000/checkout?order_id=${orderId}`,
        notify_url: "https://biz-booster.vercel.app/api/cashfree-webhook",
      },
    };

    const cfRes = await createCashfreeOrder(orderData);

    // ✅ Step 3: Validate Cashfree Response
    if (!cfRes?.order_id || !cfRes?.payment_session_id) {
      return NextResponse.json(
        { error: "Cashfree order creation failed" },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Step 4: Save to MongoDB
    await Payment.create({
      order_id: cfRes.order_id,
      payment_session_id: cfRes.payment_session_id,
      amount,
      user: user || undefined,
      name,
      email,
      phone,
      status: cfRes.order_status || "CREATED",
    });

    return NextResponse.json(cfRes);
  } catch (error: any) {
    console.error("Payment Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Payment order creation failed" },
      { status: 500 , headers: corsHeaders}
    );
  }
}
