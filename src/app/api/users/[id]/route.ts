// import { NextResponse } from 'next/server';
// import User from '@/models/User';
// import { connectToDatabase } from '@/utils/db';
// import { NextRequest } from 'next/server';

// // Correct context type
// type Params = { params: { id: string } };

// // ✅ GET /api/users/[id]
// export async function GET(
//   req: NextRequest,
//   context: { params: { id: string } }
// ) {
//   try {
//     await connectToDatabase();
//     const { id } = context.params;
//     const user = await User.findById(id);

//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     return NextResponse.json(user);
//   } catch (error) {
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Something went wrong' },
//       { status: 500 }
//     );
//   }
// }

// // ✅ PUT /api/users/[id]
// export async function PUT(req: NextRequest, { params }: Params) {
//   try {
//     await connectToDatabase();
//     const body = await req.json();
//     const updatedUser = await User.findByIdAndUpdate(params.id, body, { new: true });
//     if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

// // ✅ DELETE /api/users/[id]
// export async function DELETE(req: NextRequest, { params }: Params) {
//   try {
//     await connectToDatabase();
//     const deletedUser = await User.findByIdAndUpdate(
//       params.id,
//       { isDeleted: true },
//       { new: true }
//     );
//     if (!deletedUser) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }
//     return NextResponse.json(
//       { success: true, message: 'User soft deleted (isDeleted: true)' },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from 'next/server';
import User from '@/models/User'; // Import the User model
import { connectToDatabase } from '@/utils/db'; // Import database connection function

// PUT - Update User
export const PUT = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const { id } = params; // Extract the user ID from the URL
    const data = await req.json(); // Parse the request body

    // Connect to the database
    await connectToDatabase();

    // Find the user by ID and update
    const user = await User.findByIdAndUpdate(id, data, { new: true });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Return the updated user
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 400 });
  }
};

// DELETE - Soft Delete User (set a flag instead of actual deletion)
export const DELETE = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const { id } = params; // Extract the user ID from the URL

    // Connect to the database
    await connectToDatabase();

    // Soft delete the user by setting isDeleted flag to true
    const user = await User.findByIdAndUpdate(
      id,
      { isDeleted: true }, // Set a field to indicate soft delete
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Return a success message
    return NextResponse.json({ message: 'User soft deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 400 });
  }
};
