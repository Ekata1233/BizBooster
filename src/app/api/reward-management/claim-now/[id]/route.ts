import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import ClaimNow from "@/models/ClaimNow";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ GET by ID
export async function GET(req: Request) {
  await connectToDatabase();
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const claim = await ClaimNow.findById(id).populate("user", "fullName email");
    if (!claim) return NextResponse.json({ success: false, message: "Claim not found" }, { status: 404, headers: corsHeaders });
    return NextResponse.json({ success: true, data: claim }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error fetching claim" }, { status: 500, headers: corsHeaders });
  }
}

// ✅ PUT - Update Claim
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
          const upload = await imagekit.upload({ file: buffer, fileName: `${uuidv4()}-${file.name}`, folder: "/claim-now" });
          updates.rewardPhoto = upload.url;
        }
      } else if (key === "isClaimAccepted") {
        const str = value as string;
        updates.isClaimAccepted = str === "true" ? true : str === "false" ? false : null;
      } else {
        updates[key] = value;
      }
    }

    const updatedClaim = await ClaimNow.findByIdAndUpdate(id, updates, { new: true }).populate("user", "fullName email");

    if (!updatedClaim) return NextResponse.json({ success: false, message: "Claim not found" }, { status: 404, headers: corsHeaders });

    return NextResponse.json({ success: true, data: updatedClaim }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: corsHeaders });
  }
}

// ✅ DELETE - Delete Claim
export async function DELETE(req: Request) {
  await connectToDatabase();
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const deleted = await ClaimNow.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: "Claim not found" }, { status: 404, headers: corsHeaders });

    return NextResponse.json({ success: true, message: "Deleted successfully" }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error deleting claim" }, { status: 500, headers: corsHeaders });
  }
}
