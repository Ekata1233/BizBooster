import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { userValidationSchema } from '@/validation/userValidation';
import User from '@/models/User';
import { connectToDatabase } from '@/utils/db'; // Import connectToDatabase function
import { generateOtp } from '@/utils/generateOtp';

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

    // Hash the password
    const hashedPassword = await bcrypt.hash(parsedData.password, 10);

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

    // Create a new user (OTP will be handled later)
    const newUser = new User({
      ...parsedData,
      password: hashedPassword,
      referralCode,
      isMobileVerified: false, 
    });

    await newUser.save();
    const otp = generateOtp();
    console.log(`OTP for ${parsedData.email}: ${otp}`); // Send OTP to console (can be replaced with actual OTP sending service)

    // Store OTP in DB (temporarily for verification)
    newUser.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP expires in 5 minutes
      verified: false,
    };
    await newUser.save();
    return NextResponse.json({ message: 'User registered successfully, OTP sent separately' }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 400 });
  }
};
