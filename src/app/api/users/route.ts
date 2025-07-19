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
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    console.log("search params : ", searchParams);

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sort = searchParams.get('sort');
    const search = searchParams.get('search'); // ✅ New: extract search param

    const filter: {
      createdAt?: { $gte?: Date; $lte?: Date };
      $or?: { [key: string]: { $regex: string; $options: string } }[];
    } = {};

    // ✅ Search filter logic
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { mobileNumber: searchRegex },
      ];
    }

    // ✅ Date filter
    if (startDate || endDate) {
      const createdAtFilter: { $gte?: Date; $lte?: Date } = {};

      if (startDate && !isNaN(new Date(startDate).getTime())) {
        createdAtFilter.$gte = new Date(startDate);
      }

      if (endDate && !isNaN(new Date(endDate).getTime())) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        createdAtFilter.$lte = end;
      }

      if (Object.keys(createdAtFilter).length > 0) {
        filter.createdAt = createdAtFilter;
      }
    }

    // ✅ Sorting
    let sortOption: Record<string, 1 | -1> = {};
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
        sortOption = { createdAt: -1 };
    }

    // const limit = parseInt(searchParams.get('limit') || '10', 10);
    // const page = parseInt(searchParams.get('page') || '1', 10);
    // const skip = (page - 1) * limit;

    console.log("Final Filter:", JSON.stringify(filter, null, 2));

    const users = await User.find(filter).sort(sortOption);

    return NextResponse.json(
      users.length > 0 ? { users } : { users, message: 'No users found' },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('Error fetching users:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 400, headers: corsHeaders });
  }
};
