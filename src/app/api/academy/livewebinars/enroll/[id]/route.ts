import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import LiveWebinars,  { ILiveWebinar } from '@/models/LiveWebinars';
import mongoose from 'mongoose';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};




export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}


interface PutRequestBody {
  users: string[]; // Array of user IDs (strings)
  status: boolean; // The status to set for these users
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const webinarId = params.id;

  if (!webinarId || !mongoose.Types.ObjectId.isValid(webinarId)) {
    return NextResponse.json(
      { success: false, message: 'Invalid Webinar ID format.' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let requestBody: PutRequestBody; // Use the specific interface here

    if (contentType.includes('application/json')) {
      requestBody = await req.json() as PutRequestBody; // Cast to the interface
    } else {
      return NextResponse.json(
        { success: false, message: 'Unsupported Content-Type. Expected application/json.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const users = requestBody.users;
    const status = requestBody.status;

    if (!users || !Array.isArray(users) || users.length === 0 || typeof status !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid "users" array or "status" boolean in request body.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Use ILiveWebinar for the webinar document type
    const webinar = await LiveWebinars.findById(webinarId) as (ILiveWebinar & mongoose.Document) | null;
    if (!webinar) {
      return NextResponse.json({ success: false, message: 'Webinar not found.' }, { status: 404, headers: corsHeaders });
    }

    let updatedCount = 0;
    const errors: string[] = [];

    for (const userId of users) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        errors.push(`Invalid user ID format: ${userId}`);
        continue;
      }

      const objectId = new mongoose.Types.ObjectId(userId);
      // Find the index of the user entry in the 'user' array
      // Use ILiveWebinar['user'][number] to correctly type the array element
      const existingIndex = webinar.user.findIndex(
        (uEntry: ILiveWebinar['user'][number]) => uEntry.user && uEntry.user.equals(objectId)
      );

      if (existingIndex !== -1) {
        // User found, update their status
        if (webinar.user[existingIndex].status !== status) {
          webinar.user[existingIndex].status = status;
          updatedCount++;
        }
      } else {
        // User not found in the enrollment list, add them
        webinar.user.push({ user: objectId, status: status });
        updatedCount++;
      }
    }

    if (updatedCount === 0 && errors.length > 0) {
        return NextResponse.json(
            { success: false, message: `Failed to process some user IDs: ${errors.join(', ')}` },
            { status: 400, headers: corsHeaders }
        );
    } else if (updatedCount === 0) {
        return NextResponse.json(
            { success: true, message: 'No changes needed or all statuses already matched.' },
            { status: 200, headers: corsHeaders }
        );
    }

    await webinar.save();

    const updatedPopulatedWebinar = await LiveWebinars.findById(webinarId).populate({
      path: 'user.user',
      select: 'fullName email mobileNumber',
    });

    return NextResponse.json(
      { success: true, message: 'Enrollment status updated successfully.', data: updatedPopulatedWebinar },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('Error updating enrollment status:', error);
    return NextResponse.json(
      { success: false, message: (error as Error).message || 'Failed to update enrollment status.' },
      { status: 500, headers: corsHeaders }
    );
  }
}