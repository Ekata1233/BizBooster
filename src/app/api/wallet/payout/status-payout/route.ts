// src/app/api/cashfree/payout-status/route.ts
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ─────────────── OPTIONS (CORS preflight) ───────────────
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

// ─────────────── POST (Check Batch Payout Status) ───────────────
export async function POST(req: Request) {
  try {
     const {  batchTransferId, transfers } = await req.json();

    // Make GET request to Cashfree's Batch Transfer Status API
    const res = await fetch(
      "https://sandbox.cashfree.com/payout/transfers/batch",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2024-01-01",
          "x-client-id":process.env.CASHFREE_PAYOUT_ID!,
          "x-client-secret":process.env.CASHFREE_PAYOUT_SECRET_KEY!,
         },
        body: JSON.stringify({
          batch_transfer_id: batchTransferId,
          transfers: transfers,
        }),
      }
    );

    const data = await res.json();

    return NextResponse.json(data, {
      status: res.status,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error creating batch transfer:", error);
    return NextResponse.json(
      { error: "Batch transfer failed", details: error },
      { status: 500, headers: corsHeaders }
    );
  }
}