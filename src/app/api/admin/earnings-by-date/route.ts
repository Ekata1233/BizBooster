import { NextRequest, NextResponse } from 'next/server';
import AdminEarnings from '@/models/AdminEarnings';
import { connectToDatabase } from '@/utils/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};


export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {

    const earnings = await AdminEarnings.find({  });

    if (!earnings) {
      return NextResponse.json(
        { success: false, message: 'AdminEarnings not found for the given date' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: earnings },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
