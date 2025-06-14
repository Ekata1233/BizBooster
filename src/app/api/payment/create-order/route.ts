import { NextRequest, NextResponse } from "next/server";
import { createCashfreeOrder } from "@/utils/cashfree";
import Payment from "@/models/Payment";
import { connectToDatabase } from "@/utils/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();

    const orderData = {
      order_id: `order_${Date.now()}`,
      order_amount: body.amount,
      order_currency: "INR",
      customer_details: {
        customer_id: body.customer_id,
        customer_email: body.email,
        customer_phone: body.phone,
        customer_name: body.name,
      },
      order_note: "Next.js Cashfree Payment",
      order_meta: {
        return_url: "http://localhost:3000/checkout?order_id={order_id}",
        notify_url: "http://localhost:3000/api/payment/webhook",
      },
    };

    const cfRes = await createCashfreeOrder(orderData);

    // Save to MongoDB
    await Payment.create({
      order_id: cfRes.order_id,
      payment_session_id: cfRes.payment_session_id,
      amount: body.amount,
      customer_id: body.customer_id,
      name: body.name,
      email: body.email,
      phone: body.phone,
      status: cfRes.order_status,
    });

    return NextResponse.json(cfRes);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Payment order creation failed" },
      { status: 500 }
    );
  }
}
