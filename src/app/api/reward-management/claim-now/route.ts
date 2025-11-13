import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import ClaimNow from "@/models/ClaimNow";
import "@/models/Reward";
import "@/models/User";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS (CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ GET - All claim requests
export async function GET() {
  await connectToDatabase();

  try {
    const claims = await ClaimNow.find()
      .populate("user", "userId fullName email packageType packageActive packageActivateDate packageStatus")
      .populate("reward", "name photo description")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: claims },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ POST - Create a claim with only user, reward, isClaimRequest
export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const { user, reward, isClaimRequest } = await req.json();

    if (!user || !reward) {
      return NextResponse.json(
        { success: false, message: "User ID and Reward ID are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Create claim with all other fields as null/default
    const newClaim = await ClaimNow.create({
      user,
      reward,
      rewardName: null,
      rewardPhoto: null,
      rewardDescription: null,
      disclaimer: null,
      isAdminApproved: false,
      isClaimSettled: false,
      isClaimRequest: !!isClaimRequest,
      isClaimAccepted: null,
    });

    return NextResponse.json(
      { success: true, data: newClaim },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
