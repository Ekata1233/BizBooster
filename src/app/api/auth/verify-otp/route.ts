// src/app/api/auth/verify-otp/route.ts
import User from '@/models/User';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { email, otpCode } = body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check OTP validity
    if (user.otp.code !== otpCode || user.otp.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Mark OTP as verified
    user.otp.verified = true;
    await user.save();

    return NextResponse.json({ message: 'OTP verified successfully' }, { status: 200 });
  }catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 400 });
  }
};
