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

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing ID in URL.' },
        { status: 400, headers: corsHeaders }
      );
    }

    let videoIndexRaw = url.searchParams.get('videoIndex');
    const formData = await req.formData();

    if (videoIndexRaw === null) {
      const fromForm = formData.get('videoIndex');
      if (typeof fromForm === 'string') {
        videoIndexRaw = fromForm;
      }
    }

    const videoIndex = Number(videoIndexRaw);
    if (Number.isNaN(videoIndex) || videoIndex < 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid videoIndex.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const fullName = formData.get('fullName') as string | null;
    const rawVideo = formData.get('videoUrl'); // Optional file

    const doc = await UnderStandingFetchTrue.findById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Entry not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    const videoArray = doc.videos || doc.videoUrl;
    if (
      !Array.isArray(videoArray) ||
      videoIndex < 0 ||
      videoIndex >= videoArray.length
    ) {
      return NextResponse.json(
        { success: false, message: 'videoIndex out of range.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Update fullName if provided
    if (fullName && fullName.trim() !== '') {
      doc.fullName = fullName.trim();
    }

    // Upload new video if provided
    if (rawVideo instanceof File && rawVideo.size > 0) {
      const buffer = Buffer.from(await rawVideo.arrayBuffer());
      const { default: imagekit } = await import('@/utils/imagekit');

      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${Date.now()}-${rawVideo.name}`,
        folder: '/webinars/videos',
      });

      const newVideoData = {
        fileName: rawVideo.name,
        filePath: uploadResponse.url,
        fileId: uploadResponse.fileId,
      };

      if (doc.videos) {
        doc.videos[videoIndex] = newVideoData;
      } else {
        doc.videoUrl[videoIndex] = newVideoData;
      }
    }

    const updated = await doc.save();

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Internal Server Error',
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

    // Optional: Delete from ImageKit
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
