import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import User from "@/models/User";

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
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch users referred by the given ID
    const referredUsers = await User.find({ referredBy: id }).select("-password -otp");

    return NextResponse.json(
      { success: true, data: referredUsers },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("Error fetching referred users:", error);
    return NextResponse.json(
      { success: false, message: "Server error." },
      { status: 500, headers: corsHeaders }
    );
  }
}
