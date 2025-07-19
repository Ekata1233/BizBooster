import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Provider from '@/models/Provider';

/** PATCH: Update a specific image at given index */
export async function PATCH(req: NextRequest, { params }: { params: { id: string; index: string } }) {
  await connectToDatabase();

  const formData = await req.formData();
  const newImageUrl = formData.get("newImageUrl") as string;
  const idx = parseInt(params.index);

  if (!newImageUrl || isNaN(idx)) {
    return NextResponse.json({ error: 'Missing or invalid input' }, { status: 400 });
  }

  const provider = await Provider.findById(params.id);
  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  if (idx < 0 || idx >= provider.galleryImages.length) {
    return NextResponse.json({ error: 'Invalid image index' }, { status: 400 });
  }

  provider.galleryImages[idx] = newImageUrl;
  await provider.save();

  return NextResponse.json({ success: true, updatedImages: provider.galleryImages });
}

/** DELETE: Delete image by index */
export async function DELETE(req: NextRequest, { params }: { params: { id: string; index: string } }) {
  await connectToDatabase();

  const idx = parseInt(params.index);
  const provider = await Provider.findById(params.id);
  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  if (isNaN(idx) || idx < 0 || idx >= provider.galleryImages.length) {
    return NextResponse.json({ error: 'Invalid image index' }, { status: 400 });
  }

  provider.galleryImages.splice(idx, 1);
  await provider.save();

  return NextResponse.json({ success: true, updatedImages: provider.galleryImages });
}
