import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/utils/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ✅ Handle preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ GET - Fetch User
export const GET = async (_req: Request, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();
    const user = await User.findById(params.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
    return NextResponse.json(user, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
};

// ✅ PUT - Update User
export const PUT = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();
    const body = await req.json();
    const updatedUser = await User.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
    return NextResponse.json({ success: true, user: updatedUser }, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
};

// ✅ DELETE - Soft Delete User
export const DELETE = async (_req: Request, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json({ success: true, message: 'User soft deleted (isDeleted: true)' }, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
};
