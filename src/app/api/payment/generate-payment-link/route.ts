import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;

// Common CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { amount, customerId, customerName, customerEmail } = body;

  try {
    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      {
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: customerId,
          customer_name: customerName,
          customer_email: customerEmail,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
        },
      }
    );

    const paymentLink = response.data.payment_session_id
      ? `https://sandbox.cashfree.com/pg/checkout/${response.data.payment_session_id}`
      : null;

    return NextResponse.json({ paymentLink }, { headers: corsHeaders });
  } catch (err) {
    console.error("Cashfree Error:", err);
    return NextResponse.json(
      { error: "Failed to generate payment link" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
