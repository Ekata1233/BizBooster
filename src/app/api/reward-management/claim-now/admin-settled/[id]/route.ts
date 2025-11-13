import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import ClaimNow from "@/models/ClaimNow";
import "@/models/Reward";
import "@/models/User";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS (CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ PUT — Update claim settlement status, reward photo, and description
export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // get claim _id

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Claim ID is required in URL" },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { isClaimSettled, rewardPhoto, rewardDescription } = body;

    // Validate required fields
    if (typeof isClaimSettled !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isClaimSettled must be true or false" },
        { status: 400, headers: corsHeaders }
      );
    }

    const updatedClaim = await ClaimNow.findByIdAndUpdate(
      id,
      {
        isClaimSettled,
        rewardPhoto: rewardPhoto || null,
        rewardDescription: rewardDescription || null,
      },
      { new: true }
    )
      .populate(
        "user",
        "userId fullName email packageType packageActive packageActivateDate packageStatus"
      )
      .populate("reward", "name photo description");

    if (!updatedClaim) {
      return NextResponse.json(
        { success: false, message: "Claim not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Claim ${isClaimSettled ? "settled" : "unsettled"} successfully`,
        data: updatedClaim,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error updating claim settlement:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error updating claim settlement" },
      { status: 500, headers: corsHeaders }
    );
  }
}
