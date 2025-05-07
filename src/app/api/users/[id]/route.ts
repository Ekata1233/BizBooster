import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/utils/db';

type Context = {
  params: {
    id: string;
  };
};

export const GET = async (_req: NextRequest, { params }: Context) => {
  try {
    await connectToDatabase();
    const user = await User.findById(params.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const PUT = async (req: NextRequest, { params }: Context) => {
  try {
    await connectToDatabase();
    const body = await req.json();
    const updatedUser = await User.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const DELETE = async (_req: NextRequest, { params }: Context) => {
  try {
    await connectToDatabase();
    const deletedUser = await User.findByIdAndDelete(params.id);
    if (!deletedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'User deleted' }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
