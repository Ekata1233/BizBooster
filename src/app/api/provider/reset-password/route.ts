// src/app/api/provider/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import bcrypt from "bcryptjs";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle Preflight
export async function OPTIONS() {
    return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    await connectToDatabase();

    try {
        const { email, token, newPassword } = await req.json();

        if (!email || !token || !newPassword) {
            return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400, headers: corsHeaders });
        }

        const provider = await Provider.findOne({
            email,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // ensure token not expired
        });

        if (!provider) {
            return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 400, headers: corsHeaders });
        }

        // Hash and save new password
        provider.password = await bcrypt.hash(newPassword, 10);
        provider.resetPasswordToken = undefined;
        provider.resetPasswordExpires = undefined;
        await provider.save();

        return NextResponse.json({ success: true, message: "Password reset successful" }, { headers: corsHeaders });
    } catch (err) {
        console.error("Reset password error:", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500, headers: corsHeaders });
    }
}
