import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { slug, ref_id } = await req.json();

    if (!slug || !ref_id) {
      return NextResponse.json({ error: "Missing slug or ref_id" }, { status: 400, headers: corsHeaders });
    }

    // Step 1: Get new access token
    const authRes = await axios.post("https://apps.typof.in/api/external/auth", {
      client_id: process.env.SMEPAY_CLIENT_ID,
      client_secret: process.env.SMEPAY_CLIENT_SECRET,
    });

    const accessToken = authRes.data.access_token;

    // Step 2: Call SMEpay to check payment status
    const res = await axios.post(
      "https://apps.typof.com/api/external/check-qr-status",
      {
        client_id: process.env.SMEPAY_CLIENT_ID,
        slug,
        ref_id,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const payment_status = res.data?.data?.payment_status || "PENDING";

    return NextResponse.json({ status: payment_status }, { headers: corsHeaders });
  } catch (err: any) {
    console.error("Check QR Error:", err.response?.data || err.message);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500, headers: corsHeaders });
  }
}
