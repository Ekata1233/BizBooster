import {NextRequest, NextResponse } from 'next/server';
import VideoProgress from '@/models/UserProgress ';
import { connectToDatabase } from '@/utils/db';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};




export async function GET(req : NextRequest) {
  await connectToDatabase();
  
  const url = new URL(req.url);
  const videoId = url.pathname.split("/").pop(); 
  const userId = url.searchParams.get('userId');

  if (!userId || !videoId) {
    return NextResponse.json({ message: 'Missing userId or videoId' }, { status: 400, headers: corsHeaders });
  }

  try {
    const progress = await VideoProgress.findOne({ userId, videoId });

    if (!progress) {
      return NextResponse.json({ isCompleted: false }, { status: 200, headers: corsHeaders });
    }

    return NextResponse.json({ isCompleted: progress.isCompleted }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching single video progress:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}