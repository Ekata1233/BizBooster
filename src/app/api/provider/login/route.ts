import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Provider from '@/models/Provider';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400, headers: corsHeaders });
    }

    const provider = await Provider.findOne({ email });

    if (!provider) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401, headers: corsHeaders });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401, headers: corsHeaders });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: provider._id, email: provider.email, name: provider.name },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return NextResponse.json({
      success: true,
      data: {
        token,
        provider: {
          _id: provider._id,
          name: provider.name,
          email: provider.email,
          // any other fields you want to expose
        },
      }
    }, { status: 200, headers: corsHeaders });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
  }
}
