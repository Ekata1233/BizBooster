import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import User from "@/models/User";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ PATCH: Update referredBy field based on referralCode
export async function PATCH(req: Request) {
  await connectToDatabase();

  try {
    const { userId, referralCode } = await req.json();

    if (!userId || !referralCode) {
      return NextResponse.json(
        { success: false, message: "Missing userId or referralCode." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find the referrer by referralCode
    const referrer = await User.findOne({ referralCode });

    if (!referrer) {
      return NextResponse.json(
        { success: false, message: "Invalid referral code." },
        { status: 404, headers: corsHeaders }
      );
    }

    // Update the target user's referredBy field
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { referredBy: referrer._id },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "ReferredBy updated successfully.", data: updatedUser },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
