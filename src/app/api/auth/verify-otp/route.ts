import User from '@/models/User';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { email, otpCode } = body;
    console.log("otop in database : ", otpCode)
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check OTP validity
    if (user.otp.code !== otpCode || user.otp.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Mark OTP as verified and update the isMobileVerified field
    user.otp.verified = true;
    user.isMobileVerified = true;
    await user.save();

    return NextResponse.json({ message: 'OTP verified successfully, mobile number verified' }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 400 });
  }
};

