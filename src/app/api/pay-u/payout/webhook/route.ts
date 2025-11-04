import { connectToDatabase } from "@/utils/db";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(req) {
  try {
    await connectToDatabase();

    const event = await req.json();

    console.log("PayU Payout Webhook:", event);

    return NextResponse.json(
      { received: true },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Webhook error:", err.message);
    return NextResponse.json(
      { error: "Webhook processing failed", details: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
