import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import ClaimNow from "@/models/ClaimNow";
import "@/models/Reward";
import "@/models/User";
import imagekit from "@/utils/imagekit"; // ✅ if you use ImageKit for uploads

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS (CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ PUT — Update claim settlement (with FormData)
export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Claim ID is required in URL" },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Parse FormData instead of JSON
    const formData = await req.formData();
    const isClaimSettled = formData.get("isClaimSettled") === "true";
    const rewardDescription = formData.get("rewardDescription") as string | null;
    const rewardPhotoFile = formData.get("rewardPhoto") as File | null;

    let rewardPhotoUrl: string | null = null;

    // ✅ If file exists, upload to ImageKit
    if (rewardPhotoFile && rewardPhotoFile.size > 0) {
      const buffer = Buffer.from(await rewardPhotoFile.arrayBuffer());
      const upload = await imagekit.upload({
        file: buffer,
        fileName: rewardPhotoFile.name,
        folder: "/reward-photos",
      });
      rewardPhotoUrl = upload.url;
    }

    // ✅ Update the claim
    const updatedClaim = await ClaimNow.findByIdAndUpdate(
      id,
      {
        isClaimSettled,
        rewardPhoto: rewardPhotoUrl || null,
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
