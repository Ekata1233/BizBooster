// src/app/api/provider/[id]/gallery/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Provider from '@/models/Provider';
import imagekit from '@/utils/imagekit';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// PATCH: Upload/append images to galleryImages
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    const files = formData.getAll('galleryImages') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400, headers: corsHeaders }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `gallery_${uuidv4()}`;

      const uploadRes = await imagekit.upload({
        file: buffer,
        fileName,
        folder: "/providers/gallery",
      });

      uploadedUrls.push(uploadRes.url);
    }

    const updated = await Provider.findByIdAndUpdate(
      params.id,
      { $push: { galleryImages: { $each: uploadedUrls } } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updated.galleryImages },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('PATCH /provider/[id]/gallery error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET: All gallery images
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();

  const provider = await Provider.findById(params.id).select('galleryImages');

  if (!provider) {
    return NextResponse.json(
      { error: 'Provider not found' },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    { galleryImages: provider.galleryImages },
    { headers: corsHeaders }
  );
}
