import { connectToDatabase } from "@/utils/db";
import axios from "axios";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function GET(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const txId = searchParams.get("txId");

    if (!txId)
      return NextResponse.json(
        { error: "txId is required" },
        { status: 400, headers: corsHeaders }
      );

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

    // 2️⃣ Check status
    const resp = await axios.get(
      `https://uatoneapi.payu.in/payout/v1/transfer/status/${txId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          payoutMerchantId: process.env.PAYU_PAYOUTS_MERCHANT_ID,
        },
      }
    );

    return NextResponse.json(resp.data, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("Status error:", err.response?.data || err.message);
    return NextResponse.json(
      { error: "Failed to get payout status", details: err.response?.data || err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
