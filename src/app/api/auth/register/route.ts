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
    console.log("after validation data : ", parsedData)

    // const existingUserByEmail = await User.findOne({ email: parsedData.email });
    // const existingUserByMobile = await User.findOne({ mobileNumber: parsedData.mobileNumber });
    const existingUserByEmail = await User.findOne({ email: parsedData.email, isDeleted: { $ne: true } });
    const existingUserByMobile = await User.findOne({ mobileNumber: parsedData.mobileNumber, isDeleted: { $ne: true } });


    const isMobileBlocked = existingUserByMobile &&
      existingUserByMobile.otp?.verified === true &&
      existingUserByMobile.isMobileVerified === true;

    if (existingUserByEmail && isMobileBlocked) {
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
      if (isMobileBlocked) {
        return NextResponse.json(
          { error: 'Mobile already exists' },
          { status: 400, headers: corsHeaders }
        );
      } else {
        return NextResponse.json(
          {
            error: 'User with this mobile already exists but is not verified. Please complete verification.',
          },
          { status: 409, headers: corsHeaders } // 409 Conflict
        );
      }
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


    let referredBy = null;
    let referringUser = null;

    if (parsedData.referredBy) {
      referringUser = await User.findOne({ referralCode: parsedData.referredBy });

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
      isMobileVerified: true,
      personalDetailsCompleted: true
    });

    await newUser.save();

    if (referringUser) {
      referringUser.myTeams.push(newUser._id);
      await referringUser.save();
    }

    return NextResponse.json(
      { success: true, message: 'Register Successfull' },
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
