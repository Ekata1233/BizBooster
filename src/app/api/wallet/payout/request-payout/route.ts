// src/app/api/cashfree/request-payout/route.ts
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
   const body = await req.json();

    const transferId = body.transfer_id;
    const amount = body.transfer_amount;
    const beneId = body.beneficiary_details?.beneficiary_id;

    console.log("amount : ", amount, "beneId : ", beneId, "transferId : ", transferId);

    const res = await fetch("https://sandbox.cashfree.com/payout/transfers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2024-01-01",
        "x-client-id": process.env.CASHFREE_PAYOUT_ID!,
        "x-client-secret": process.env.CASHFREE_PAYOUT_SECRET_KEY!,
      },
      body: JSON.stringify({
        transfer_id: transferId,
        transfer_amount: amount,
        beneficiary_details: {
          beneficiary_id: beneId,
        },
      }),
    });

    const data = await res.json();

    return NextResponse.json(data, {
      status: res.status,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error requesting payout:", error);
    return NextResponse.json(
      { error: "Payout request failed", details: error },
      { status: 500, headers: corsHeaders }
    );
  }
}
