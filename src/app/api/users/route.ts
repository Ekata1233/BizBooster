import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User'; // Import the User model
import { connectToDatabase } from '@/utils/db'; // Import database connection function

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ✅ Handle preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
export const GET = async (req: NextRequest) => {
  try {
    // Connect to the database
    await connectToDatabase();

    // Get query params
    const { searchParams } = new URL(req.url);
    console.log("search params : ", searchParams)
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sort = searchParams.get('sort'); // newest, oldest, asc, desc, etc.
    console.log({ startDate, endDate, sort });

    const filter: any = {};

    if (startDate || endDate) {
      const createdAtFilter: any = {};

      if (startDate && !isNaN(new Date(startDate).getTime())) {
        createdAtFilter.$gte = new Date(startDate);
      }

      if (endDate && !isNaN(new Date(endDate).getTime())) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // <-- extend to end of the day
        createdAtFilter.$lte = end;
      }

      if (Object.keys(createdAtFilter).length > 0) {
        filter.createdAt = createdAtFilter;
      }
    }

    // Build sort options
    let sortOption: any = {};

    switch (sort) {
      case 'latest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'ascending':
        sortOption = { fullName: 1 };
        break;
      case 'descending':
        sortOption = { fullName: -1 };
        break;
      default:
        sortOption = { createdAt: -1 }; // default to newest
    }

    console.log("Filter being used:", filter);


    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;
    // Fetch users with filters and sorting
    const users = await User.find(filter).sort(sortOption).skip(skip).limit(limit);

    if (users.length === 0) {
      // return NextResponse.json({ users }, { status: 200 });
      return NextResponse.json({ users, message: 'No users found' }, { status: 200 });
    }

    // Return the users as a JSON response
    return NextResponse.json({ users }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching users:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 400, headers: corsHeaders });
  }
};
