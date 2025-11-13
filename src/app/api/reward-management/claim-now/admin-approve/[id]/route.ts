import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import ClaimNow from "@/models/ClaimNow";
import Deposite from "@/models/Deposite"; // ✅ Import Deposite model
import "@/models/Reward";
import "@/models/User";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ PUT — Update admin approval, rewardTitle, and disclaimer by claim _id
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
    const { isAdminApproved, rewardTitle, disclaimer } = body;

    if (typeof isAdminApproved !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isAdminApproved must be true or false" },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Find the claim first (to check if it has extraMonthlyEarnRequest)
    const claim = await ClaimNow.findById(id)
      .populate(
        "user",
        "userId fullName email packageType packageActive packageActivateDate packageStatus"
      )
      .populate("reward", "name photo description extraMonthlyEarn");

    if (!claim) {
      return NextResponse.json(
        { success: false, message: "Claim not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // ✅ Update admin approval info
    claim.isAdminApproved = isAdminApproved;
    claim.rewardTitle = rewardTitle ?? claim.rewardTitle;
    claim.disclaimer = disclaimer ?? claim.disclaimer;
    await claim.save();

    // ✅ If this claim is for extra monthly earn → update Deposite
    if (claim.isExtraMonthlyEarnRequest && claim.reward?.extraMonthlyEarn) {
      const extraAmount = Number(claim.reward.extraMonthlyEarn) || 0;

      if (extraAmount > 0) {
        const deposite = await Deposite.findOne({ user: claim.user._id });

        if (deposite) {
          deposite.monthlyEarnings += extraAmount;
          await deposite.save();
          console.log(
            `✅ Added ₹${extraAmount} to ${claim.user.fullName}'s monthly earnings`
          );
        } else {
          console.warn(`⚠️ No Deposite record found for user ${claim.user._id}`);
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Claim ${isAdminApproved ? "approved" : "disapproved"} successfully`,
        data: claim,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error updating claim:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error updating claim" },
      { status: 500, headers: corsHeaders }
    );
  }
}
