import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import HelpAndSupport from '@/models/HelpandSupport';



export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const { id } = context.params;
    const chats = await HelpAndSupport.find({ user: id }) // ⬅ correct field
      .populate('user', 'fullName email')
      .sort({ createdAt: 1 });

    return NextResponse.json({ success: true, data: chats });
  } catch (err) {
    console.error('Error fetching user chats:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
