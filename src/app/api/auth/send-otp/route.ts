
import { generateOtp } from '@/utils/generateOtp';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { email } = body; // Assume email is sent for OTP

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate OTP
    const otp = generateOtp();
    console.log(`OTP for ${email}: ${otp}`); // Send OTP to console

    // Store OTP in DB (temporarily for verification)
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 24 * 60 * 1000), // OTP expires in 5 minutes
      verified: false,
    };
    await user.save();

    // Send OTP via email/SMS (This part can be implemented with a service like Twilio or Nodemailer)
    
    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 400 });
  }
};
