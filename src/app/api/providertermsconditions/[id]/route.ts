import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import ProviderTermsConditions from '@/models/ProviderTermsConditions';
import { Types } from 'mongoose';

export async function PUT(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop() as string;

    const { content, module } = await req.json();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    const updated = await ProviderTermsConditions.findByIdAndUpdate(
      id,
      { content, module },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Policy not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('PUT error:', err);
    return NextResponse.json({ success: false, message: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop() as string;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    const deleted = await ProviderTermsConditions.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    console.error('DELETE error:', err);
    return NextResponse.json({ success: false, message: 'Failed to delete' }, { status: 500 });
  }
}
