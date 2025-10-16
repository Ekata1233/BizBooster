import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/x-www-form-urlencoded")) {
      return NextResponse.json(
        { error: 'Content-Type must be application/x-www-form-urlencoded' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse x-www-form-urlencoded body
    const text = await req.text();
    const params = new URLSearchParams(text);
    const data: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      data[key] = value;
    }

    console.log("PayU Webhook Received:", data);

    // TODO: Verify hash here before updating DB

    // Example: check payment status
    if (data.status === "success") {
      // Update order/payment status in DB
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("❌ Webhook Error:", error.message);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}
