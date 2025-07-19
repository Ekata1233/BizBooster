import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import ProviderHelpAndSupport, {IProviderHelpAndSupport} from '@/models/ProvidersHelpandSupport';
import mongoose from 'mongoose';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};




export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

   
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID format.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { email, call, whatsapp } = body;


    if (!email && !call && !whatsapp) {
      return NextResponse.json(
        { success: false, message: 'No fields provided for update.' },
        { status: 400, headers: corsHeaders }
      );
    }

 
    const updateData: Partial<IProviderHelpAndSupport> = {};
    if (email !== undefined) updateData.email = email;
    if (call !== undefined) updateData.call = call;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;

    const updatedEntry = await ProviderHelpAndSupport.findByIdAndUpdate(
      id,
      updateData,
      { new: true } 
    );

    if (!updatedEntry) {
      return NextResponse.json(
        { success: false, message: 'Entry not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Entry updated successfully.', data: updatedEntry },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    console.error('Error updating Help and Support entry by ID:', err);
    return NextResponse.json(
      { success: false, message: (err as Error).message || 'Failed to update entry.' },
      { status: 500, headers: corsHeaders }
    );
  }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID format.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const deletedEntry = await ProviderHelpAndSupport.findByIdAndDelete(id);

    if (!deletedEntry) {
      return NextResponse.json(
        { success: false, message: 'Entry not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Entry deleted successfully.' },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    console.error('Error deleting Help and Support entry by ID:', err);
    return NextResponse.json(
      { success: false, message: (err as Error).message || 'Failed to delete entry.' },
      { status: 500, headers: corsHeaders }
    );
  }
}