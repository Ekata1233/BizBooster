import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import UnderStandingFetchTrue from '@/models/UnderstandingFetchTrue';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function PUT(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    const videoIndex = parseInt(url.searchParams.get('videoIndex') || '');

    if (!id || isNaN(videoIndex)) {
      return NextResponse.json(
        { success: false, message: 'Invalid ID or videoIndex.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await req.formData();
    const fullName = formData.get('fullName') as string | null;
    const videoFile = formData.get('videoUrl') as File | null;

    const doc = await UnderStandingFetchTrue.findById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Entry not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    if (fullName && fullName.trim() !== '') {
      doc.fullName = fullName;
    }

if (videoFile instanceof File && videoFile.size > 0) {
  const buffer = Buffer.from(await videoFile.arrayBuffer());

  const { default: imagekit } = await import('@/utils/imagekit');

  const uploadResponse = await imagekit.upload({
    file: buffer,
    fileName: `${Date.now()}-${videoFile.name}`,
    folder: '/webinars/videos',
  });

  doc.videoUrl[videoIndex] = {
    fileName: videoFile.name,
    filePath: uploadResponse.url,
    fileId: uploadResponse.fileId,
  };
}


    const updated = await doc.save();

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  const idx = Number(url.searchParams.get('videoIndex'));

  if (!id || Number.isNaN(idx)) {
    return NextResponse.json(
      { success: false, message: 'Valid ID and videoIndex query param required' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const doc = await UnderStandingFetchTrue.findById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Entry not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    if (!doc.videoUrl || !doc.videoUrl[idx]) {
      return NextResponse.json(
        { success: false, message: 'videoIndex out of range' },
        { status: 400, headers: corsHeaders }
      );
    }

    const video = doc.videoUrl[idx];

    // Optional: Delete from ImageKit if fileId exists
if (video.fileId) {
  try {
    const { default: imagekit } = await import('@/utils/imagekit');
    await imagekit.deleteFile(video.fileId);
  } catch (err) {
    console.warn('Could not delete file from ImageKit:', err);
  }
}


    doc.videoUrl.splice(idx, 1);
    const updated = await doc.save();

    return NextResponse.json(
      { success: true, message: 'Video deleted', data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to delete video',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
