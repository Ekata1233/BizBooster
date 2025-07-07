

// import { NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '@/utils/db';
// import LiveWebinars from '@/models/LiveWebinars';
// import mongoose from 'mongoose';
// import User from '@/models/User';
// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
// };

// export async function PUT(  req: NextRequest, { params }: { params: { id: string } }) {
//   await connectToDatabase();

//   const id = params.id;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return NextResponse.json(
//       { success: false, message: 'Invalid Webinar ID format.' },
//       { status: 400, headers: corsHeaders }
//     );
//   }

//   try {
//     const contentType = req.headers.get('content-type') || '';
//     let users: string[] = [];

//     // Accept from JSON or FormData
//     if (contentType.startsWith('application/json')) {
//       const body = await req.json();
//       users = Array.isArray(body.users) ? body.users : [body.users];
//     } else {
//       const form = await req.formData();
//       const userFields = form.getAll('users'); // key: users (multiple values)
//       users = userFields.map((u) => String(u));
//     }

//     // Filter invalid IDs
//     const validUserIds = users.filter((id) =>
//       mongoose.Types.ObjectId.isValid(id)
//     );

//     if (validUserIds.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'No valid user IDs provided.' },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Add multiple users without duplicates
//     const updated = await LiveWebinars.findByIdAndUpdate(
//       id,
//       { $addToSet: { users: { $each: validUserIds } } },
//       { new: true }
//     );
//    const checkouts = await User.find({ _id: { $in: validUserIds } })
//         .populate({ path: 'user', select: 'fullName email mobileNumber' })
//         .sort({ createdAt: -1 });

//     if (!checkouts || checkouts.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Webinar not found.' },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       { success: true, data: checkouts },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, message: error?.message || 'Failed to update webinar.' },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

// export function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }



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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    await connectToDatabase();

    const id = params.id;

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

        // ✅ Update the correct schema field: 'user'
        // const updatedWebinar = await LiveWebinars.findByIdAndUpdate(
        //   id,
        //   { $addToSet: { user: { $each: validUserIds } } },
        //   { new: true }
        // );
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

        // ✅ Fetch user details for the updated user IDs
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


export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    await connectToDatabase();

    const { id } = params;

    // ✅ Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
            { success: false, message: 'Invalid webinar ID.' },
            { status: 400, headers: corsHeaders }
        );
    }

    try {
        // ✅ Fetch and populate users array
        const webinar = await LiveWebinars.findById(id).populate({
            path: 'user', // ✅ matches schema field
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
