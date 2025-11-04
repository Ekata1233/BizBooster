import { connectToDatabase } from "@/utils/db";
import axios from "axios";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // 1️⃣ Get OAuth Token
    const tokenRes = await axios.post(
      "https://accounts.payu.in/oauth/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.PAYU_PAYOUTS_CLIENT_ID,
        client_secret: process.env.PAYU_PAYOUTS_CLIENT_SECRET,
        scope: "create_payout_transactions",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;

    // 2️⃣ Add Beneficiary
    const payload = {
      clientId: "1",
      customerId: body.customerId,
      beneficiaryName: body.name,
      bankAccountNumber: body.accountNo,
      ifscCode: body.ifsc,
      beneficiaryTypeCode: "1",
      mobile: body.mobile,
      email: body.email,
    };

    const resp = await axios.post(
      "https://accounts.payu.in/payout/v1/beneficiary/add",
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          payoutMerchantId: process.env.PAYU_PAYOUTS_MERCHANT_ID,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(resp.data, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Beneficiary Add Error:", err.response?.data || err.message);
    return NextResponse.json(
      {
        error: "Failed to create beneficiary",
        details: err.response?.data || err.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
