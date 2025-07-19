import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import  Offer  from '@/models/Offer';
import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ PUT update offer
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  try {
    const id = params.id;
    const offer = await Offer.findById(id);
    if (!offer) {
      return NextResponse.json({ success: false, message: 'Offer not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const bannerImageFile = formData.get('bannerImage') as File | null;
    const offerStartTime = formData.get('offerStartTime') as string | null;
    const offerEndTime = formData.get('offerEndTime') as string | null;
    const eligibilityCriteria = formData.get('eligibilityCriteria') as string | null;
    const howToParticipate = formData.get('howToParticipate') as string | null;
    const faq = formData.get('faq') as string | null;
    const termsAndConditions = formData.get('termsAndConditions') as string | null;

    const galleryFiles = formData.getAll('galleryImages') as File[];

    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });

    // ✅ Update banner image if new provided
    if (bannerImageFile) {
      if (offer.bannerImage?.startsWith('/uploads/')) {
        await unlink(path.join(process.cwd(), 'public', offer.bannerImage)).catch(() => {});
      }
      const buffer = Buffer.from(await bannerImageFile.arrayBuffer());
      const filename = `${Date.now()}-${bannerImageFile.name}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
      offer.bannerImage = `/uploads/${filename}`;
    }

    // ✅ Replace gallery images if provided
    if (galleryFiles.length > 0) {
      for (const img of offer.galleryImages) {
        if (img.startsWith('/uploads/')) {
          await unlink(path.join(process.cwd(), 'public', img)).catch(() => {});
        }
      }
      const galleryPaths: string[] = [];
      for (const file of galleryFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        galleryPaths.push(`/uploads/${filename}`);
      }
      offer.galleryImages = galleryPaths;
    }

    if (offerStartTime) offer.offerStartTime = new Date(offerStartTime);
    if (offerEndTime) offer.offerEndTime = new Date(offerEndTime);
    if (eligibilityCriteria) offer.eligibilityCriteria = eligibilityCriteria;
    if (howToParticipate) offer.howToParticipate = howToParticipate;
    if (faq) offer.faq = faq;
    if (termsAndConditions) offer.termsAndConditions = termsAndConditions;

    await offer.save();

    return NextResponse.json({ success: true, data: offer }, { status: 200 });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// ✅ DELETE offer
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  try {
    const id = params.id;
    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) {
      return NextResponse.json({ success: false, message: 'Offer not found' }, { status: 404 });
    }

    // Delete banner and gallery images
    if (offer.bannerImage?.startsWith('/uploads/')) {
      await unlink(path.join(process.cwd(), 'public', offer.bannerImage)).catch(() => {});
    }
    for (const img of offer.galleryImages) {
      if (img.startsWith('/uploads/')) {
        await unlink(path.join(process.cwd(), 'public', img)).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, message: 'Offer deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}




// GET /api/offer/[id]
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
  await connectToDatabase();

    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    const offer = await Offer.findById(id);

    if (!offer) {
      return NextResponse.json({ success: false, message: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: offer }, { status: 200 });
  } catch (error) {
    console.error('Error fetching offer:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
