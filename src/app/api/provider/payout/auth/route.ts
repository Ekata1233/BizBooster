// src/app/api/cashfree/auth/route.ts
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ─────────────── OPTIONS (CORS preflight) ───────────────
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

// ─────────────── GET (Fetch Cashfree Auth Token) ───────────────
export async function GET() {
  try {
    const res = await fetch(
      "https://payout-gamma.cashfree.com/payout/v1/authorize",
      {
        method: "POST",
        headers: {
          "X-Client-Id": process.env.CASHFREE_PAYOUT_ID!,
          "X-Client-Secret": process.env.CASHFREE_PAYOUT_SECRET_KEY!,
        },
      }
    );

    const data = await res.json();

    return NextResponse.json(data, { status: res.status, headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching Cashfree Auth:", error);
    return NextResponse.json(
      { error: "Auth failed", details: error },
      { status: 500, headers: corsHeaders }
    );
  }
}
