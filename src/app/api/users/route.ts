import { NextResponse } from 'next/server';
import User from '@/models/User'; // Import the User model
import { connectToDatabase } from '@/utils/db'; // Import database connection function

export const GET = async () => {
  try {
    // Connect to the database
    await connectToDatabase();

    // Fetch all users from the database
    const users = await User.find({}); // Get all users

    if (users.length === 0) {
      return NextResponse.json({ message: 'No users found' }, { status: 404 });
    }

    // Return the users as a JSON response
    return NextResponse.json({ users }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching users:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 400 });
  }
};
