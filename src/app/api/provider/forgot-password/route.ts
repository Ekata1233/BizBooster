// src/app/api/provider/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import crypto from "crypto";
import { transporter } from "@/utils/nodemailer";

export const runtime = "nodejs";

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
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ success: false, message: "Email is required" }, { status: 400, headers: corsHeaders });
        }

        const provider = await Provider.findOne({ email });
        if (!provider) {
            return NextResponse.json({ success: false, message: "No account found with that email" }, { status: 404, headers: corsHeaders });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

        provider.resetPasswordToken = resetToken;
        provider.resetPasswordExpires = resetTokenExpiry;
        await provider.save();

        // Send reset email
        const resetUrl = `https://biz-booster-provider-panel.vercel.app/reset-password?token=${resetToken}&email=${email}`;

        const info = await transporter.sendMail({
            from: `"Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset Request",
            html: `
    <p>You requested a password reset.</p>
    <p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 15 minutes.</p>
  `,
        });

        console.log("Email sent:", info);


        return NextResponse.json({ success: true, message: "Password reset link sent" }, { headers: corsHeaders });
    } catch (err) {
        console.error("Forgot password error:", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500, headers: corsHeaders });
    }
}
