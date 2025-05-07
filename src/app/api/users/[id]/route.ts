import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/utils/db';
import { NextRequest } from 'next/server';

// Correct context type
type Params = { params: { id: string } };

// ✅ GET /api/users/[id]
export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
  ) {
    try {
      await connectToDatabase();
      const { id } = context.params;
      const user = await User.findById(id);
  
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
  
      return NextResponse.json(user);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Something went wrong' },
        { status: 500 }
      );
    }
  }

// ✅ PUT /api/users/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const updatedUser = await User.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// ✅ DELETE /api/users/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const deletedUser = await User.findByIdAndUpdate(
      params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, message: 'User soft deleted (isDeleted: true)' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
