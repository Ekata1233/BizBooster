import mongoose from "mongoose";
import { connectToDatabase } from "@/utils/db";
import LiveWebinars from "@/models/LiveWebinars";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET() {
  try {
    await connectToDatabase();

    const webinars = await LiveWebinars.find({});
    let updatedCount = 0;

    for (const webinar of webinars) {
      const users: unknown = webinar.user;

      const needsFix =
        Array.isArray(users) &&
        users.length > 0 &&
        (typeof users[0] === "string" || mongoose.isValidObjectId(users[0]));

      if (needsFix) {
        const fixedUsers = (users as string[]).map((id: string) => ({
          user: new mongoose.Types.ObjectId(id), // ✅ MUST be under `user`
          status: false,
        }));

        webinar.user = fixedUsers;
        await webinar.save();
        updatedCount++;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Migration completed. Updated ${updatedCount} webinars.`,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Migration error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Migration failed",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
