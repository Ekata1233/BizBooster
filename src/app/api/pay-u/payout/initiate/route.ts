import { connectToDatabase } from "@/utils/db";
import axios from "axios";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // 1️⃣ Get Access Token
    const tokenRes = await axios.post(
      "https://uatoneapi.payu.in/oauth/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.PAYU_PAYOUTS_CLIENT_ID,
        client_secret: process.env.PAYU_PAYOUTS_CLIENT_SECRET,
        scope: "payouts",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;

    // 2️⃣ Initiate Transfer
    const payload = {
      transferId: `TXN_${Date.now()}`,
      beneficiaryAccount: body.accountNo,
      beneficiaryName: body.name,
      ifsc: body.ifsc,
      amount: body.amount,
      transferMode: body.transferMode || "IMPS",
      narration: body.narration || "Test Payout from Next.js",
    };

    const resp = await axios.post(
      "https://uatoneapi.payu.in/payout/v1/transfer/initiate",
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          payoutMerchantId: process.env.PAYU_PAYOUTS_MERCHANT_ID,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Transfer Response:", resp.data);

    return NextResponse.json(resp.data, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("Initiate payout error:", err.response?.data || err.message);
    return NextResponse.json(
      {
        error: "Failed to initiate payout",
        details: err.response?.data || err.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
