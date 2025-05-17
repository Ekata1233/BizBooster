import { NextResponse } from 'next/server';
import Banner from '@/models/Banner';
import imagekit from '@/utils/imagekit';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/utils/db';
import '@/models/Category'; // ✅ Register model
import '@/models/Subcategory'; // ✅ Register model
// Removed: import '@/models/Service';

// POST - Create a new banner
export async function POST(req: Request) {
  await connectToDatabase();
  try {
    const formData = await req.formData();
    const file: File = formData.get('file') as File;
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `banner_${uuidv4()}`;

    const uploadRes = await imagekit.upload({
      file: buffer,
      fileName,
    });

    const data = {
      page: formData.get('page'),
      selectionType: formData.get('selectionType'),
      category: formData.get('category') || undefined,
      subcategory: formData.get('subcategory') || undefined,
      service: formData.get('service') || undefined,
      referralUrl: formData.get('referralUrl') || undefined,
      file: uploadRes.url,
    };

    const newBanner = await Banner.create(data);
    return NextResponse.json(newBanner, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}

// GET - Get all banners (that are not deleted)
export async function GET() {
  await connectToDatabase();
  try {
    const banners = await Banner.find({ isDeleted: false })
      .populate('category')
      .populate('subcategory');
      // Removed .populate('service')

    return NextResponse.json(banners, { status: 200 });
  } catch (err: unknown) {
  const errorMessage = err instanceof Error ? err.message : String(err);
  console.error('GET /api/banner error:', errorMessage);
  return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
}
}
