import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import LiveWebinars from '@/models/LiveWebinars';
import mongoose from 'mongoose';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};


// export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
//   await connectToDatabase();

//   const webinarId = params.id;
//   // const { userId, status } = await req.json();
//   const formData = await req.formData();
//   const userId = formData.get('userId') as string;
//   const status = formData.get('status') === 'true'; // Converts from string to boolean


//   if (!userId || typeof status !== 'boolean') {
//     return NextResponse.json({ success: false, message: 'Missing userId or status' }, { status: 400 });
//   }

//   try {
//     const webinar = await LiveWebinars.findById(webinarId);
//     if (!webinar) {
//       return NextResponse.json({ success: false, message: 'Webinar not found' }, { status: 404 });
//     }

//     // Find user entry
//     const existingEntryIndex = webinar.user.findIndex(
//       (u: any) => u.user.toString() === userId
//     );

//     if (existingEntryIndex !== -1) {
//       // Update existing user's status
//       webinar.user[existingEntryIndex].status = status;
//     } else {
//       // Add new user entry with status
//       // webinar.user.push({ user: userId, status });
//       webinar.user.push({ user: new mongoose.Types.ObjectId(userId), status });

//     }

//     await webinar.save();
//     return NextResponse.json({ success: true, message: 'Status updated' });
//   } catch (err) {
//     console.error('Error updating enrollment status:', err);
//     return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
//   }
// }


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const webinarId = params.id;

  const formData = await req.formData();
  const users = formData.getAll('users') as string[]; // ⬅️ Get array
  const status = formData.get('status') === 'true';   // ⬅️ Convert to boolean

  if (!users || !Array.isArray(users) || typeof status !== 'boolean') {
    return NextResponse.json({ success: false, message: 'Missing users or invalid status' }, { status: 400 });
  }

  try {
    const webinar = await LiveWebinars.findById(webinarId);
    if (!webinar) {
      return NextResponse.json({ success: false, message: 'Webinar not found' }, { status: 404 });
    }

    users.forEach((userId) => {
      try {
        const objectId = new mongoose.Types.ObjectId(userId); // validate
        const existingIndex = webinar.user.findIndex((u: any) => u.user.toString() === userId);

        if (existingIndex !== -1) {
          webinar.user[existingIndex].status = status;
        } else {
          webinar.user.push({ user: objectId, status });
        }
      } catch (error) {
        console.error(`Invalid ObjectId: ${userId}`, error);
      }
    });

    await webinar.save();
    return NextResponse.json({ success: true, message: 'Status updated' });
  } catch (err) {
    console.error('Error updating enrollment status:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   await connectToDatabase();

//   const webinarId = params.id;
//   const { userId, status } = await req.json();

//   if (!mongoose.Types.ObjectId.isValid(webinarId) || !mongoose.Types.ObjectId.isValid(userId)) {
//     return NextResponse.json(
//       { success: false, message: "Invalid webinarId or userId" },
//       { status: 400, headers: corsHeaders }
//     );
//   }

//   if (typeof status !== 'boolean') {
//     return NextResponse.json(
//       { success: false, message: "Status must be boolean" },
//       { status: 400, headers: corsHeaders }
//     );
//   }

//   try {
//     const webinar = await LiveWebinars.findById(webinarId);
//     if (!webinar) {
//       return NextResponse.json(
//         { success: false, message: "Webinar not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     const userEntry = webinar.user.find((entry: any) =>
//       entry.user.toString() === userId
//     );

//     if (!userEntry) {
//       return NextResponse.json(
//         { success: false, message: "User not enrolled in this webinar" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     userEntry.status = status;
//     await webinar.save();

//     return NextResponse.json(
//       { success: true, message: "Status updated successfully" },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (err) {
//     console.error("Error updating user status:", err);
//     return NextResponse.json(
//       { success: false, message: "Internal server error" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }



// export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
//   await connectToDatabase();

//   const { userId, status } = await req.json();

//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     return NextResponse.json({ success: false, message: "Invalid user ID." }, { headers: corsHeaders });
//   }

//   const webinar = await LiveWebinars.findById(params.id);

//   if (!webinar) {
//     return NextResponse.json({ success: false, message: "Webinar not found." }, { headers: corsHeaders });
//   }

//   // Check if user already exists
//   const existing = webinar.user.find(u => u.user.toString() === userId);
//   if (existing) {
//     existing.status = status; // update status
//   } else {
//     webinar.user.push({ user: userId, status }); // add new user
//   }

//   await webinar.save();

//   return NextResponse.json({ success: true, data: webinar }, { headers: corsHeaders });
// }