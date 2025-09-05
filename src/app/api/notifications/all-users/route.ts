import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import User from "@/models/User";
import { messaging } from "@/utils/firebaseAdmin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { title, body } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Get all user tokens
    const users = await User.find({ fcmTokens: { $exists: true, $ne: [] }, isDeleted: false }).select("fcmTokens");

    const allTokens = users.flatMap((user) => user.fcmTokens);

    if (allTokens.length === 0) {
      return NextResponse.json(
        { error: "No user tokens found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // ✅ Batch tokens (500 max per request)
    const chunks = [];
    for (let i = 0; i < allTokens.length; i += 500) {
      chunks.push(allTokens.slice(i, i + 500));
    }

    const results = [];
    for (const chunk of chunks) {
      const message = {
        notification: { title, body },
        tokens: chunk,
      };
      const response = await messaging.sendEachForMulticast(message);
      results.push(response);
    }

    return NextResponse.json(
      { success: true, totalUsers: allTokens.length, results },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500, headers: corsHeaders }
    );
  }
}
