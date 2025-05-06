// src/app/api/auth/send-otp/route.ts
import { generateOtp } from '@/utils/generateOtp';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { email } = body; // Assume email is sent for OTP

    // Generate OTP
    const otp = generateOtp();
    console.log(`OTP for ${email}: ${otp}`); // Send OTP to console

    // Here, you can implement sending the OTP through an email/SMS service.
    
    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 400 });
  }
};
