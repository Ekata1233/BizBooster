import { NextRequest, NextResponse } from "next/server";
// import { writeFile,  mkdir } from "fs/promises";
// import path from "path";
import imagekit from "@/utils/imagekit";
import { connectToDatabase } from "@/utils/db";
import PartnerReview, { IPartnerReview } from '@/models/PartnerReview'; // Adjust path if necessary

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}



const isNonEmptyFile = (v: unknown): v is File =>
  typeof v === 'object' && v instanceof File && v.size > 0;

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const title = (formData.get('title') ?? '').toString().trim();
    const rawImage = formData.get('imageUrl'); // required
    const rawVideo = formData.get('videoUrl'); // optional (string or file)

    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Title is required.' },
        { status: 400, headers: corsHeaders },
      );
    }

    // --- Upload Image to ImageKit ---
    let imageUrl = '';
    if (isNonEmptyFile(rawImage)) {
      const imageBuffer = Buffer.from(await rawImage.arrayBuffer());
      const uploadedImage = await imagekit.upload({
        file: imageBuffer, // Buffer
        fileName: `${Date.now()}-${rawImage.name}`,
        folder: 'partnerreview/images', // Optional folder in ImageKit
      });
      imageUrl = uploadedImage.url;
    } else {
      return NextResponse.json(
        { success: false, message: 'Image file is required.' },
        { status: 400, headers: corsHeaders },
      );
    }

    // --- Handle Video ---
    let videoUrl = '';
    if (isNonEmptyFile(rawVideo)) {
      const videoBuffer = Buffer.from(await rawVideo.arrayBuffer());
      const uploadedVideo = await imagekit.upload({
        file: videoBuffer,
        fileName: `${Date.now()}-${rawVideo.name}`,
        folder: 'partnerreview/videos',
      });
      videoUrl = uploadedVideo.url;
    } else if (typeof rawVideo === 'string') {
      videoUrl = rawVideo.trim();
    }

    // --- Save to DB ---
    const created = await PartnerReview.create({
      title,
      imageUrl,
      videoUrl,
    });

    return NextResponse.json(
      { success: true, data: created },
      { status: 201, headers: corsHeaders },
    );
  } catch (err: unknown) {
    console.error('POST /api/partnerreview error:', err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Internal Server Error',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

// GET (Read) - Fetch all ClickableVideo entries
export async function GET() {
  await connectToDatabase();

  try {
    const partnerReviews: IPartnerReview[] = await PartnerReview.find({}).sort({ createdAt: -1 });

    // Format file paths for frontend access
    const formattedData = partnerReviews.map((entry) => ({
      _id: entry._id,
      title: entry.title,
      description: entry.description,
      imageUrl: entry.imageUrl.startsWith('/')
        ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}${entry.imageUrl}`
        : entry.imageUrl,
      videoUrl: entry.videoUrl.startsWith('/')
        ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}${entry.videoUrl}`
        : entry.videoUrl,
      
    }));

    return NextResponse.json(
      { success: true, data: formattedData },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('GET /api/clickable-videos error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
