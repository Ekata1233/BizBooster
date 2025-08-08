import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import UpcomingCommission from "@/models/UpcomingCommission";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const body = await req.json();

    const {
      checkoutId,
      bookingId,
      leadId,
      share_3,
      share_2,
      share_1,
      providerId,
      adminId,
      providerAmount,
      adminAmount,
      share_3Amount,
      share_2Amount,
      share_1Amount,
      extraProviderAmount,
      extraAdminAmount,
      extra_share_3Amount,
      extra_share_2Amount,
      extra_share_1Amount
    } = body;

    await UpcomingCommission.create({
      checkoutId,
      bookingId,
      leadId,
      share_3,
      share_2,
      share_1,
      providerId,
      adminId,
      providerAmount,
      adminAmount,
      share_3Amount,
      share_2Amount,
      share_1Amount,
      extraProviderAmount,
      extraAdminAmount,
      extra_share_3Amount,
      extra_share_2Amount,
      extra_share_1Amount
    });

    return NextResponse.json({ success: true, message: "Receivable data saved." }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Receivable commission save error:", message);
    return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
  }
}
