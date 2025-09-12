// POST /api/save-fcm-token
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import User from "@/models/User";

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
        const { userId, fcmToken } = await req.json();

        if (!userId || !fcmToken) {
            return NextResponse.json({ error: "userId and fcmToken required" }, { status: 400 });
        }

        await connectToDatabase();
        await User.findByIdAndUpdate(userId, {
            $addToSet: { fcmTokens: fcmToken }, // ✅ prevent duplicates
        });

        return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
    }
}
