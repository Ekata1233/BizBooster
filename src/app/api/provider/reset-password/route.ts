// src/app/api/provider/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import crypto from "crypto";

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
        const { email, token, newPassword } = await req.json();

        console.log("email ; ", email)
        console.log("token ; ", token)
        console.log("newPassword ; ", newPassword)


        if (!email || !token || !newPassword) {
            return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400, headers: corsHeaders });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const provider = await Provider.findOne({
            email,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }, 
        });

        console.log("provider ; ", provider)

        if (!provider) {
            return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 400, headers: corsHeaders });
        }

        // Hash and save new password
        provider.password = newPassword;
        provider.resetPasswordToken = undefined;
        provider.resetPasswordExpires = undefined;
        await provider.save();

        return NextResponse.json({ success: true, message: "Password reset successful" }, { headers: corsHeaders });
    } catch (err) {
        console.error("Reset password error:", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500, headers: corsHeaders });
    }
}
