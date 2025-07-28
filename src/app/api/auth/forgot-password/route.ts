// /src/app/api/auth/reset-password/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { email, mobileNumber, newPassword } = await req.json();

    console.log("new password : ", newPassword)

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400, headers: corsHeaders });
    }

    const user = await User.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404, headers: corsHeaders });
    }

    if (!user.otp?.verified) {
      return NextResponse.json({ error: "OTP not verified." }, { status: 403, headers: corsHeaders });
    }

    // user.password = await bcrypt.hash(newPassword, 10);
    // user.otp = { code: '', verified: false, expiresAt: null }; // clear OTP
    user.password = newPassword;

    await user.save();

    return NextResponse.json({ success: true, message: "Password reset successful." }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong." }, { status: 500, headers: corsHeaders });
  }
}
