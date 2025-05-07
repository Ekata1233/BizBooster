import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/utils/db';

// GET user by ID
export const GET = async (_req: Request, context: { params: { id: string } }) => {
  try {
    await connectToDatabase();
    const user = await User.findById(context.params.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

// UPDATE user by ID
export const PUT = async (req: Request, context: { params: { id: string } }) => {
  try {
    await connectToDatabase();
    const body = await req.json();
    const updatedUser = await User.findByIdAndUpdate(context.params.id, body, { new: true });
    if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

// DELETE user by ID
export const DELETE = async (_req: Request, context: { params: { id: string } }) => {
  try {
    await connectToDatabase();
    const deletedUser = await User.findByIdAndDelete(context.params.id);
    if (!deletedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'User deleted' }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
