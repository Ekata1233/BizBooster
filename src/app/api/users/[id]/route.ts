import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Define TypeScript types
type Item = {
  id: string;
  name: string;
  description?: string;
};

// Mock database (replace with your actual database operations)
let items: Item[] = [
  { id: '1', name: 'Item 1', description: 'First item' },
  { id: '2', name: 'Item 2', description: 'Second item' },
];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Validate the request body
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Find the item to update
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Update the item
    const updatedItem: Item = {
      ...items[itemIndex],
      ...body,
      id // Ensure the ID remains the same
    };

    items[itemIndex] = updatedItem;

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

