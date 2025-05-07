import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectToDatabase } from '@/utils/db';

export const POST = async (req: Request) => {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { email, mobileNumber, password } = body;

    if (!email && !mobileNumber) {
      return NextResponse.json({ error: 'Email or Mobile number is required' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const user = await User.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    console.log("Input password:", password);
    console.log("Stored hashed password:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // ✅ Remove password and otp without assigning unused variables
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.otp;
    const userInfo = userObject;
    
    return NextResponse.json({ message: 'Login successful', token, user: userInfo }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
};
