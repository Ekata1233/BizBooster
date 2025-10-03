import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import HelpAndSupport from '@/models/HelpandSupport';
import mongoose from 'mongoose';
import '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { userId, question } = body;

    if (!userId || !question) {
      return NextResponse.json({ success: false, message: 'Missing userId or question' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID format' }, { status: 400 });
    }

    // Save only the question for now, no answer
    const supportEntry = await HelpAndSupport.create({
      user: userId,
      question,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, message: 'Question submitted', data: supportEntry });
  } catch (err) {
    console.error('Error submitting question:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}




export async function GET() {
  try {
    await connectToDatabase();

    const supportEntries = await HelpAndSupport.find()
      .populate('user', 'fullName email profilePhoto') 
      .sort({ createdAt: 1 });

    return NextResponse.json({ success: true, data: supportEntries });
  } catch (err) {
    console.error('Error fetching support entries:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
