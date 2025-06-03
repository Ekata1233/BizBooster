import { NextRequest, NextResponse } from 'next/server';
import Banner from '@/models/Banner';
import imagekit from '@/utils/imagekit';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/utils/db';
import '@/models/Category'; // ✅ Register model
import '@/models/Subcategory'; 

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
// POST - Create a new banner
export async function POST(req: Request) {
  await connectToDatabase();
  try {
    const formData = await req.formData();
    const file: File = formData.get('file') as File;
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `banner_${uuidv4()}`;

    console.log("Formdata : ", formData);

    const uploadRes = await imagekit.upload({
      file: buffer,
      fileName,
    });

    const data = {
      page: formData.get('page'),
      selectionType: formData.get('selectionType'),
      module: formData.get('module') || undefined,
      category: formData.get('category') || undefined,
      subcategory: formData.get('subcategory') || undefined,
      service: formData.get('service') || undefined,
      referralUrl: formData.get('referralUrl') || undefined,
      file: uploadRes.url,
    };

    const newBanner = await Banner.create(data);
    return NextResponse.json(newBanner, {
      status: 201, // or 200 depending on your use case
      headers: corsHeaders
    });

  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500, headers: corsHeaders });


  }
}

// GET - Get all banners (that are not deleted)
export async function GET(req: NextRequest) {
  await connectToDatabase();
  try {
    const { searchParams } = new URL(req.url);
    console.log("search params : ", searchParams)
    const search = searchParams.get('search');
    const subcategory = searchParams.get('subcategory');
    const sort = searchParams.get('sort');

 const filter: Record<string, unknown> = { isDeleted: false };
    if (search) {
      filter.$or = [
        { page: { $regex: search, $options: 'i' } }
      ];
    }

    if (subcategory) {
      filter.subcategory = subcategory;
    }

    // Build query
    let sortOption: Record<string, 1 | -1> = {};

    switch (sort) {
      case 'latest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'ascending':
        sortOption = { subcategory: 1 };
        break;
      case 'descending':
        sortOption = { subcategory: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const banners = await Banner.find(filter)
      .populate('module')
      .populate('category')
      .populate('subcategory')
      .sort(sortOption)
      .exec();
    // Removed .populate('service')

    return NextResponse.json(banners, { status: 200, headers: corsHeaders });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('GET /api/banner error:', errorMessage);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500, headers: corsHeaders });
  }
}
