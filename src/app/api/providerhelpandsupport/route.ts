import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import ProviderHelpAndSupport from '@/models/ProvidersHelpandSupport';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, call, whatsapp } = body;

    if (!email || !call || !whatsapp) {
      return NextResponse.json(
        { success: false, message: 'Missing email, call, or whatsapp' },
        { status: 400, headers: corsHeaders }
      );
    }

    // **Check if a Help and Support entry already exists**
    const existingEntry = await ProviderHelpAndSupport.findOne();

    if (existingEntry) {
      // Update the existing entry
      existingEntry.email = email;
      existingEntry.call = call;
      existingEntry.whatsapp = whatsapp;
      await existingEntry.save();

      return NextResponse.json(
        { success: true, message: 'Help and Support data updated successfully', data: existingEntry },
        { status: 200, headers: corsHeaders }
      );
    }

    // Create a new entry if none exists
    const supportEntry = await ProviderHelpAndSupport.create({ email, call, whatsapp });

    return NextResponse.json(
      { success: true, message: 'Help and Support data created successfully', data: supportEntry },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    console.error('Error submitting Help and Support data:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();

    const allEntries = await ProviderHelpAndSupport.find({});

    return NextResponse.json(
      { success: true, message: 'All Help and Support data fetched successfully.', data: allEntries },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    console.error('Error fetching all Help and Support data:', err);
    return NextResponse.json(
      { success: false, message: (err as Error).message || 'Failed to fetch all Help and Support data.' },
      { status: 500, headers: corsHeaders }
    );
  }
}