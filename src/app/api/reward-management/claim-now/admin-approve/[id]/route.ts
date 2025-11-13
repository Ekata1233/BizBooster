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

    // Validate required fields
    if (typeof isAdminApproved !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isAdminApproved must be true or false" },
        { status: 400, headers: corsHeaders }
      );
    }

    const updatedClaim = await ClaimNow.findByIdAndUpdate(
      id,
      { isAdminApproved, rewardTitle, disclaimer },
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
        message: `Claim ${isAdminApproved ? "approved" : "disapproved"} successfully`,
        data: updatedClaim,
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
