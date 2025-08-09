// POST /api/video-progress
import { NextResponse,NextRequest } from 'next/server';
import VideoProgress from '@/models/UserProgress ';
import { connectToDatabase } from '@/utils/db';
// import mongoose from 'mongoose';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};


export async function POST(req : NextRequest) {
  await connectToDatabase();
  const { userId, certificateId, videoId } = await req.json();

  if (!userId || !certificateId || !videoId) {
    return NextResponse.json({ message: 'Invalid data provided' },  { status: 400, headers: corsHeaders });
  }

  try {
    const progress = await VideoProgress.findOneAndUpdate(
      { userId, videoId }, // Find a document by the combination of user and video ID
      {
        certificateId,
        isCompleted: true, // Mark it as completed
      },
      { new: true, upsert: true } // Return the updated doc, create if it doesn't exist
    );

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error saving video progress:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}



// export async function GET(req : NextRequest) {
//   await connectToDatabase();
//   const url = new URL(req.url);
//   const userId = url.searchParams.get('userId');
//   const certificateId = url.searchParams.get('certificateId');

//   if (!userId || !certificateId) {
//     return NextResponse.json({ message: 'Missing userId or certificateId' }, { status: 400, headers: corsHeaders });
//   }

//   try {
//     // const userProgress = await VideoProgress.find({ userId, certificateId });
//      const userProgress = await VideoProgress.find({});

//     if (!userProgress) {
//       return NextResponse.json({ message: 'No progress found' }, { status: 404,headers: corsHeaders });
//     }

//     return NextResponse.json(userProgress);
//   } catch (error) {
//     console.error('Error fetching user progress:', error);
//     return NextResponse.json({ message: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
//   }
// }



export async function GET() {
  await connectToDatabase();

  try {
    const userProgress = await VideoProgress.find({});

    if (!userProgress || userProgress.length === 0) {
      return NextResponse.json({ message: 'No progress found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(userProgress, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}