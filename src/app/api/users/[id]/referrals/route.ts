import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import { connectToDatabase } from "@/utils/db";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    // Extract `id` from the URL
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    // Check if valid ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid user id" },
        { status: 400 }
      );
    }

    // Find the user by ObjectId
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Count how many users used this user's referral
    const count = await User.countDocuments({
      referredBy: user._id,
      isDeleted: false,
    });

    // Optional: get details of referred users
    const users = await User.find({
      referredBy: user._id,
      isDeleted: false,
    })
      .select("fullName email mobileNumber createdAt")
      .lean();

    return NextResponse.json({ success: true, count, users });
  } catch (err) {
    console.error("Referral count API error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
