import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import ClaimNow from "@/models/ClaimNow";
import "@/models/Reward";
import "@/models/User";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ GET — Fetch claim by ID
export async function GET(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const claim = await ClaimNow.findById(id)
    .populate("user", "userId fullName email packageType packageActive packageActivateDate packageStatus")
      .populate("reward", "name photo description")
      .sort({ createdAt: -1 });

    if (!claim) {
      return NextResponse.json(
        { success: false, message: "Claim not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: claim },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error fetching claim:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error fetching claim" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ PUT — Update a claim (with optional photo upload)
export async function PUT(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const formData = await req.formData();
    const updates: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (key === "rewardPhoto") {
        const file = value as File;
        if (file && file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const upload = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${file.name}`,
            folder: "/claim-now",
          });
          updates.rewardPhoto = upload.url;
        }
      } else if (key === "isClaimAccepted") {
        const str = value as string;
        updates.isClaimAccepted =
          str === "true" ? true : str === "false" ? false : null;
      } else {
        updates[key] = value;
      }
    }

    const updatedClaim = await ClaimNow.findByIdAndUpdate(id, updates, {
      new: true,
    }).populate("user", "fullName email");

    if (!updatedClaim) {
      return NextResponse.json(
        { success: false, message: "Claim not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedClaim },
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

// ✅ DELETE — Remove a claim by ID
export async function DELETE(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const deletedClaim = await ClaimNow.findByIdAndDelete(id);

    if (!deletedClaim) {
      return NextResponse.json(
        { success: false, message: "Claim not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Claim deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error deleting claim:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error deleting claim" },
      { status: 500, headers: corsHeaders }
    );
  }
}
