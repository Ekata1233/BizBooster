import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, amount } = body;

    // Create a unique customer ID
    const customerId = `CUS_${Date.now()}`;

    // Create payment link with Cashfree
    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/links",
      {
        link_amount: Number(amount),
        link_currency: "INR",
        link_purpose: "Payment for your booking",
        customer_details: {
          customer_id: customerId,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
        },
        link_notify: {
          send_email: true,
          send_sms: false,
        },
        link_meta: {
          return_url: `https://biz-booster.vercel.app/payment-success?customer_id=${customerId}`,
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

    const paymentLink = response.data.link_url;

    return NextResponse.json(
      { success: true, paymentLink },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Cashfree Error:", error?.response?.data || error.message);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.response?.data?.message || "Failed to generate payment link",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
