import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db'; // Assuming correct path
import UnderStandingFetchTrue from '@/models/UnderstandingFetchTrue'; // Assuming correct path

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

    const body = await req.json();
    const { fullName, videoIndex, youtubeUrl } = body;

    if (typeof videoIndex !== 'number' || videoIndex < 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid videoIndex provided in body.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const doc = await UnderStandingFetchTrue.findById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, message: 'Entry not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Direct check for doc.videoUrl array and index validity
    if (
      !doc.videoUrl ||
      !Array.isArray(doc.videoUrl) ||
      videoIndex >= doc.videoUrl.length ||
      videoIndex < 0
    ) {
      return NextResponse.json(
        { success: false, message: 'videoIndex out of range or video array missing.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Update fullName if provided and not empty
    if (fullName !== undefined && typeof fullName === 'string' && fullName.trim() !== '') {
      // Add validation for fullName here if not already handled by schema's pre-save hooks
      // Example: if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(fullName.trim())) { /* return error */ }
      doc.fullName = fullName.trim();
    }

    // Update YouTube URL if provided and not empty
    if (youtubeUrl !== undefined && typeof youtubeUrl === 'string' && youtubeUrl.trim() !== '') {
      // Update the filePath of the specific video item in videoUrl array
      doc.videoUrl[videoIndex].filePath = youtubeUrl.trim();
      // Optionally update fileName, or keep it as 'YouTube Video'
      // doc.videoUrl[videoIndex].fileName = 'Updated YouTube Video';
    } else {
        // If youtubeUrl is explicitly provided but empty, consider it an error as a URL is expected
        return NextResponse.json(
            { success: false, message: 'YouTube URL cannot be empty for update.' },
            { status: 400, headers: corsHeaders }
        );
    }

    const updated = await doc.save();

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('PUT error:', error); // This log will now show the actual error
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
  const idx = Number(url.searchParams.get('videoIndex')); // Get videoIndex from query param

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

    // Ensure videoUrl array exists and index is valid
    if (
      !doc.videoUrl || // Check if videoUrl array exists
      !Array.isArray(doc.videoUrl) || // Ensure it's an array
      idx < 0 || // Check if index is non-negative
      idx >= doc.videoUrl.length // Check if index is within bounds
    ) {
      return NextResponse.json(
        { success: false, message: 'videoIndex out of range or video array missing.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // *** REMOVED ImageKit deletion logic ***
    // The previous code checked for video.fileId, which is not relevant for YouTube URLs.
    // YouTube videos are not stored on your ImageKit.

    doc.videoUrl.splice(idx, 1); // Remove the video item at the specified index
    const updated = await doc.save(); // Save the updated document

    return NextResponse.json(
      { success: true, message: 'Video deleted', data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    console.error('DELETE error:', err); // More specific error logging
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to delete video',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}



export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop(); // Extract the ID from the URL path

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing entry ID in URL.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find the entry by its ID
    const entry = await UnderStandingFetchTrue.findById(id);

    if (!entry) {
      return NextResponse.json(
        { success: false, message: 'Entry not found.' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Return the found entry
    return NextResponse.json({ success: true, data: entry }, { status: 200, headers: corsHeaders });
  } catch (error: unknown) {
    console.error('GET /api/academy/understandingfetchtrue/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
