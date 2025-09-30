// src/app/api/provider/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import crypto from "crypto";
import { transporter } from "@/utils/nodemailer";

export const runtime = "nodejs";

const allowedOrigins = [
    'http://localhost:3001',
    'https://biz-booster.vercel.app',
    'http://localhost:3000',
    'https://biz-booster-provider-panel.vercel.app',
    'https://api.fetchtrue.com',// ✅ ADD THIS LINE
    'http://localhost:3002',
];
function getCORSHeaders(origin: string) {
    const headers = new Headers();
    if (allowedOrigins.includes(origin)) {
        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        headers.set('Access-Control-Allow-Credentials', 'true');
    }
    return headers;
}

// ✅ Preflight CORS support
export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get("origin") || "";
    const headers = getCORSHeaders(origin);
    return new NextResponse(null, { status: 204, headers });
}

export async function POST(req: NextRequest) {
    await connectToDatabase();

     const origin = req.headers.get("origin") || "";
    const corsHeaders = getCORSHeaders(origin);

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const provider = await Provider.findOne({ email });
    if (!provider) {
      // Don’t expose whether email exists (security)
      return NextResponse.json(
        { success: true, message: "If this email exists, a reset link was sent." },
        { headers: corsHeaders }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    provider.resetPasswordToken = hashedToken;
    provider.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await provider.save({ validateBeforeSave: false });

    // Reset URL with plain token (hashed one stays in DB)
    const resetUrl = `https://biz-booster-provider-panel.vercel.app/reset-password?token=${resetToken}&email=${email}`;

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 15 minutes.</p>
      `,
    });
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS?.length);

    return NextResponse.json(
      { success: true, message: "If this email exists, a reset link was sent." },
      { headers: corsHeaders }
    );
  } catch (err: any) {
  console.error("Forgot password error:", err.message, err.stack);
  return NextResponse.json(
    { success: false, message: err.message }, // <== return real error to test
    { status: 500, headers: corsHeaders }
  );
}

}
