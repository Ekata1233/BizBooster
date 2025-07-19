import { NextRequest, NextResponse } from "next/server";
import { writeFile,  mkdir } from "fs/promises";
import path from "path";
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

// POST (Create) - Add a new ClickableVideo entry

// export async function POST(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const formData = await req.formData();
//     const title = formData.get("title") as string | undefined;
//     const description = formData.get("description") as string | undefined;
//     const imageFile = formData.get("imageUrl") as File; // Expecting a file for imageUrl
//     const videoFile = formData.get("videoUrl") as File; // Expecting a file for videoUrl

//     if (!imageFile || !videoFile) {
//       return NextResponse.json(
//         { success: false, message: "Image file and video file are required." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const uploadDir = path.join(process.cwd(), "public/uploads");
//     await mkdir(uploadDir, { recursive: true });

//     // Save image file
//     const imageBytes = await imageFile.arrayBuffer();
//     const imageBuffer = Buffer.from(imageBytes);
//     const imageFilename = `${Date.now()}-image-${imageFile.name}`;
//     const imageFilePath = path.join(uploadDir, imageFilename);
//     await writeFile(imageFilePath, imageBuffer);
//     const imageUrl = `/uploads/${imageFilename}`;

//     // Save video file
//     const videoBytes = await videoFile.arrayBuffer();
//     const videoBuffer = Buffer.from(videoBytes);
//     const videoFilename = `${Date.now()}-video-${videoFile.name}`;
//     const videoFilePath = path.join(uploadDir, videoFilename);
//     await writeFile(videoFilePath, videoBuffer);
//     const videoUrl = `/uploads/${videoFilename}`;

//     const newPartnerReview = await PartnerReview.create({
//       title,
//       description,
//       imageUrl,
//       videoUrl,
//     });

//     return NextResponse.json(
//       { success: true, data: newPartnerReview },
//       { status: 201, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     console.error("POST /api/partner-review error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: (error as Error).message || "Internal Server Error",
//       },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


// POST /api/partnerreview
export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    const title = formData.get('title') as string | undefined;
    const rawImage = formData.get('imageUrl'); // File (required)
    const rawVideo = formData.get('videoUrl'); // File OR string (YouTube)

    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Title is required.' },
        { status: 400, headers: corsHeaders },
      );
    }
    if (!(rawImage instanceof File) || rawImage.size === 0) {
      return NextResponse.json(
        { success: false, message: 'Image file is required.' },
        { status: 400, headers: corsHeaders },
      );
    }

    // --- save image file ---
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });
    const imgBuf = Buffer.from(await rawImage.arrayBuffer());
    const imageFilename = `${Date.now()}-image-${rawImage.name}`;
    await writeFile(path.join(uploadDir, imageFilename), imgBuf);
    const imageUrl = `/uploads/${imageFilename}`;

    // --- handle video (url OR file) ---
    let videoUrl: string = '';
    if (rawVideo instanceof File && rawVideo.size > 0) {
      // legacy support: actual video upload
      const vidBuf = Buffer.from(await rawVideo.arrayBuffer());
      const videoFilename = `${Date.now()}-video-${rawVideo.name}`;
      await writeFile(path.join(uploadDir, videoFilename), vidBuf);
      videoUrl = `/uploads/${videoFilename}`;
    } else if (typeof rawVideo === 'string') {
      videoUrl = rawVideo.trim();
    }

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
