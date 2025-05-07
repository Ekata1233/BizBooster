import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/utils/db';
import { NextRequest } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: { [key: string]: string | string[] } }
) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Extract the id from params
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Parse the request body
    const body = await req.json();

    // Update the user by id
    const updatedUser = await User.findByIdAndUpdate(id, body, { new: true });
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error) {
    // Handle any errors
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}