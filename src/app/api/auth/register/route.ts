// src/app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import { userValidationSchema } from '@/validation/userValidation';
import User from '@/models/User';
import { connectToDatabase } from '@/utils/db';
import { generateOtp } from '@/utils/generateOtp';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ✅ Handle preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export const POST = async (req: Request) => {
  try {
    await connectToDatabase();

    const body = await req.json();
    const parsedData = userValidationSchema.parse(body);

    // const existingUser = await User.findOne({
    //   $or: [{ email: parsedData.email }, { mobileNumber: parsedData.mobileNumber }],
    // });

     const existingUserByEmail = await User.findOne({ email: parsedData.email });
    const existingUserByMobile = await User.findOne({ mobileNumber: parsedData.mobileNumber });

    // if (existingUser) {
    //   return NextResponse.json(
    //     { error: 'Email or Mobile already exists' },
    //     { status: 400, headers: corsHeaders }
    //   );
    // }

    if (existingUserByEmail && existingUserByMobile) {
      return NextResponse.json(
        { error: 'Email and Mobile already exists' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (existingUserByMobile) {
      return NextResponse.json(
        { error: 'Mobile already exists' },
        { status: 400, headers: corsHeaders }
      );
    }

    function generateReferralCode(length = 6) {
      return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
    }

    let referralCode: string = '';
    let exists = true;

    while (exists) {
      referralCode = generateReferralCode();
      const existing = await User.findOne({ referralCode });
      if (!existing) exists = false;
    }

    const otp = generateOtp();
    console.log(`OTP for ${parsedData.email}: ${otp}`);

    let referredBy = null;

    if (parsedData.referredBy) {
      const referringUser = await User.findOne({ referralCode: parsedData.referredBy });
      if (!referringUser) {
        return NextResponse.json(
          { error: 'Referral code is not valid' },
          { status: 400, headers: corsHeaders }
        );
      }
      referredBy = referringUser._id;
    }

    const newUser = new User({
      ...parsedData,
      referralCode,
      referredBy,
      isMobileVerified: false,
      otp: {
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        verified: false,
      },
    });

    await newUser.save();

    return NextResponse.json(
      { success: true, message: 'Please verify your OTP' },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('Error saving user:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: message },
      { status: 400, headers: corsHeaders }
    );
  }
};
