import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs/promises';
import imagekit from '@/utils/imagekit';

// Disable Next.js default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get('upload') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploaded = await imagekit.upload({
    file: buffer,
    fileName: file.name,
    folder: 'ckeditor',
  });

  // CKEditor requires this exact response format:
  return NextResponse.json({ url: uploaded.url });
}
