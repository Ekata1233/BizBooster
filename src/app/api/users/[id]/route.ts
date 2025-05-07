import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/utils/db';

// ✅ Handle preflight (OPTIONS request)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

// ✅ GET - Fetch User by ID
export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = context.params; // Correctly access id from context.params
    const user = await User.findById(id); // Fetch the user by the id
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// ✅ PUT - Update User
export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = context.params; // Correctly access id from context.params
    const body = await req.json();
    const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// ✅ DELETE - Soft Delete User
export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = context.params; // Correctly access id from context.params
    const updatedUser = await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'User soft deleted (isDeleted: true)' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
