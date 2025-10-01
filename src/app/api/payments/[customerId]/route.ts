// File: src/app/api/payments/[customerId]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Payment from "@/models/Payment";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const customerId = url.pathname.split("/").pop();

    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "Missing customerId parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const payments = await Payment.find({ customerId }).sort({ createdAt: -1 });

    if (!payments.length) {
      return NextResponse.json(
        { success: false, message: "No payments found for this customer." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: payments },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
