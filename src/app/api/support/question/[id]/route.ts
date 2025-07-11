import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import HelpAndSupport from '@/models/HelpandSupport';





export async function GET(_: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await connectToDatabase();

    const { userId } = params;

    const chats = await HelpAndSupport.find({ user: userId })
      .populate('user', 'fullName email')
      .sort({ createdAt: 1 }); // ascending by date

    return NextResponse.json({ success: true, data: chats });
  } catch (err) {
    console.error('Error fetching user chats:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}