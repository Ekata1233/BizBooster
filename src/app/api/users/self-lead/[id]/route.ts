import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Checkout from "@/models/Checkout";
import UpcomingCommission from "@/models/UpcomingCommission";
import "@/models/User";
import "@/models/Service";

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
    const id = url.pathname.split("/").pop(); // userId from URL

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing userId parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch all checkouts linked to this user
    const checkouts = await Checkout.find({ user: id })
      .populate("service", "serviceName")
      .populate("user", "fullName email mobileNumber")
      .lean();

    if (!checkouts || checkouts.length === 0) {
      return NextResponse.json(
        { success: false, message: "No leads found for this user." },
        { status: 200, headers: corsHeaders }
      );
    }

    // Prepare lead data with all commission fields
    const results = await Promise.all(
      checkouts.map(async (checkout) => {
        // Fetch commission for this checkout
        const commissionRecord = await UpcomingCommission.findOne({
          checkoutId: checkout._id,
        }).lean();

        // Calculate combined share_1 + extra_share_1
        const totalShare =
          commissionRecord
            ? Number(
                (commissionRecord.share_1 || 0) +
                  (commissionRecord.extra_share_1 || 0)
              ).toFixed(2)
            : "0.00";

             const leadStatus = checkout?.isCanceled
          ? "cancelled"
          : checkout?.isCompleted
          ? "completed"
          : checkout?.isAccepted
          ? "Accepted"
          : checkout?.orderStatus === "processing"
          ? "processing"
          : checkout?.orderStatus || "processing";

        return {
          leadId: checkout.bookingId || checkout._id,
          serviceName: checkout.service?.serviceName || "N/A",
          contactDetails: checkout.user
            ? `${checkout.user.fullName || ""} | ${checkout.user.email || ""} | ${
                checkout.user.mobileNumber || ""
              }`
            : "N/A",
          price: Number(
            checkout.grandTotal || checkout.totalAmount || 0
          ).toFixed(2),

          // Commission fields
          share_1: Number(commissionRecord?.share_1 || 0).toFixed(2),
          extra_share_1: Number(commissionRecord?.extra_share_1 || 0).toFixed(2),
          share_2: Number(commissionRecord?.share_2 || 0).toFixed(2),
          extra_share_2: Number(commissionRecord?.extra_share_2 || 0).toFixed(2),
          share_3: Number(commissionRecord?.share_3 || 0).toFixed(2),
          extra_share_3: Number(commissionRecord?.extra_share_3 || 0).toFixed(2),

          totalShare, // share_1 + extra_share_1
          leadStatus:leadStatus,
        };
      })
    );

    return NextResponse.json(
      { success: true, data: results },
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
