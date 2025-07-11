import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import LiveWebinars from '@/models/LiveWebinars';
import mongoose from 'mongoose';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function PUT(req: NextRequest) {
  await connectToDatabase();

  const url = new URL(req.url);
  const webinarId = url.pathname.split('/').pop() as string;

  const formData = await req.formData();
  const users = formData.getAll('users') as string[];
  const status = formData.get('status') === 'true';

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
        const objectId = new mongoose.Types.ObjectId(userId);
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
