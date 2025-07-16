import { NextRequest, NextResponse } from "next/server";

// ✅ Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Adjust to your frontend domain for production
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS handler (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ POST handler to receive webhook data
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    console.log("Webhook Received:", data);

    const { order_id, status, amount, reference_id } = data;

    // 🔁 TODO: Update your database here
    // Example logic:
    // - Find order by order_id or reference_id
    // - Update status to 'paid', 'failed', etc.
    // - Store SMEpay reference_id for audit

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Webhook error:", error.message);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500, headers: corsHeaders });
  }
}
