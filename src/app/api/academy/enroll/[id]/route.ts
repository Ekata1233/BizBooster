import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import LiveWebinars from '@/models/LiveWebinars';
import mongoose from 'mongoose';
import User from '@/models/User';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function PUT(req: NextRequest) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop() as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid Webinar ID format.' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let users: string[] = [];

    if (contentType.startsWith('application/json')) {
      const body = await req.json();
      users = Array.isArray(body.users) ? body.users : [body.users];
    } else {
      const form = await req.formData();
      const userFields = form.getAll('users');
      users = userFields.map((u) => String(u));
    }

    const validUserIds = users.filter((uid) => mongoose.Types.ObjectId.isValid(uid));

    if (validUserIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid user IDs provided.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const updatedWebinar = await LiveWebinars.findByIdAndUpdate(
      id,
      { $addToSet: { user: { $each: validUserIds } } },
      { new: true }
    ).populate('user', 'fullName email mobileNumber');

    if (!updatedWebinar) {
      return NextResponse.json(
        { success: false, message: 'Webinar not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    const usersData = await User.find({ _id: { $in: validUserIds } }).select('fullName email mobileNumber');

    return NextResponse.json(
      { success: true, data: { webinar: updatedWebinar, users: usersData } },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: (error as Error).message || 'Failed to update webinar.' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// export async function GET(req: NextRequest) {
//   await connectToDatabase();

//   const url = new URL(req.url);
//   const id = url.pathname.split('/').pop() as string;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return NextResponse.json(
//       { success: false, message: 'Invalid webinar ID.' },
//       { status: 400, headers: corsHeaders }
//     );
//   }

//   try {
//     const webinar = await LiveWebinars.findById(id).populate({
//       path: 'user',
//       select: 'fullName email mobileNumber',
//     });

//     if (!webinar) {
//       return NextResponse.json(
//         { success: false, message: 'Webinar not found.' },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       { success: true, data: webinar },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     console.error('GET /livewebinars/[id] error:', error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: (error as Error).message || 'Failed to fetch webinar data.',
//       },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


export async function GET(req: NextRequest) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop() as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: 'Invalid webinar ID.' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const webinar = await LiveWebinars.findById(id)
      .populate({
        path: 'user.user',
        model: 'User',
        select: 'fullName email mobileNumber',
      });

    if (!webinar) {
      return NextResponse.json(
        { success: false, message: 'Webinar not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: webinar },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('GET /livewebinars/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        message: (error as Error).message || 'Failed to fetch webinar data.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}


export function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
