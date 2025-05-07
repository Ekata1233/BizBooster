import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // Extract the 'id' from params
  const { id } = params;
  
  // Handle your PUT request logic here (e.g., update a user with the provided ID)
  // For example, updating user in the database using the 'id'

  return NextResponse.json({ message: `User with id ${id} updated successfully!` });
}
