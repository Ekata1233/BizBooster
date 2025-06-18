import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Payment from "@/models/Payment";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { order_id, order_status } = body;

    console.log("Webhook Received:", body);

    if (!order_id || !order_status) {
      return NextResponse.json({ error: "Missing order data" }, { status: 400 , headers:corsHeaders });
    }

    // ✅ Update payment status in DB
    const updated = await Payment.findOneAndUpdate(
      { order_id },
      { status: order_status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404, headers:corsHeaders });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500, headers:corsHeaders });
  }
}


