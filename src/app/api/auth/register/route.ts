import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { userValidationSchema } from '@/validation/userValidation';
import User from '@/models/User';
import { generateOtp } from '@/utils/generateOtp';
import { connectToDatabase } from '@/utils/db'; // Import connectToDatabase function

export const POST = async (req: Request) => {
  try {
    // Connect to the database before performing any operations
    await connectToDatabase();

    const body = await req.json();
    const parsedData = userValidationSchema.parse(body);

    // Check for existing user (email or mobile)
    const existingUser = await User.findOne({
      $or: [{ email: parsedData.email }, { mobileNumber: parsedData.mobileNumber }],
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email or Mobile already exists' }, { status: 400 });
    }

    // Generate OTP
    const otp = generateOtp();
    console.log(`OTP for ${parsedData.email}: ${otp}`); // Send OTP to console

    // Save OTP to DB (temporarily for validation later)
    const newUser = new User({
      ...parsedData,
      password: await bcrypt.hash(parsedData.password, 10),
      otp: { code: otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000), verified: false },
    });

    await newUser.save();
    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 400 });
  }
};
