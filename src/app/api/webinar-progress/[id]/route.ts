import WebinarProgress from '@/models/Webinar-Progress';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const webinarId = searchParams.get("webinarId");

  if (!userId || !webinarId) {
    return NextResponse.json({ message: "Missing query params" }, { status: 400, headers: corsHeaders });
  }

  try {
    const progress = await WebinarProgress.findOne({ userId, webinarId });
    return NextResponse.json(progress, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching webinar progress:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}
