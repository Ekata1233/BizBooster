// src/app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import { userValidationSchema } from '@/validation/userValidation';
import bcrypt from 'bcrypt';
import User from '@/models/User';
import { generateOtp } from '@/utils/generateOtp';
import { connectToDatabase } from '@/utils/db'; // Ensure the connectToDatabase function is imported

export const POST = async (req: Request) => {
  try {
    // Connect to the database before performing any operations
    await connectToDatabase(); // This should connect to the database

    const body = await req.json(); // Parse the request body
    const parsedData = userValidationSchema.parse(body); // Validate the data

    // Check for existing user (email or mobile)
    const existingUser = await User.findOne({
      $or: [{ email: parsedData.email }, { mobileNumber: parsedData.mobileNumber }],
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email or Mobile already exists' }, { status: 400 });
    }

    // Generate OTP
    const otp = generateOtp();
    console.log(`OTP for ${parsedData.email}: ${otp}`); // OTP logging for debugging

    // Save OTP and other user details into the database
    const newUser = new User({
      ...parsedData,
      password: await bcrypt.hash(parsedData.password, 10),
      otp: { code: otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000), verified: false }, // Add OTP with expiry
    });

    // Save the new user to the database
    await newUser.save();
    console.log('User saved successfully:', newUser);

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error saving user:', error); // Log error to debug
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 400 });
  }
};
