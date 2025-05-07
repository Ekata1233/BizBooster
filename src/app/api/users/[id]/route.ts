import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDatabase } from '@/utils/db';
import { NextRequest } from 'next/server';

// This will automatically extract the `id` from the dynamic route
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Parse the request body
    const body = await req.json();

    // Update the user by id
    const updatedUser = await User.findByIdAndUpdate(params.id, body, { new: true });

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
