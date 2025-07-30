import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from "@/utils/db";
// import Webinars from '@/models/Webinars'; // Adjust path as needed
import Certifications from '@/models/Certifications';
import imagekit from "@/utils/imagekit"; // Assuming you have imagekit setup
import { v4 as uuidv4 } from 'uuid'; // For unique file names

// Assuming corsHeaders are defined somewhere accessible, e.g., in a separate file or directly here
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Initialize ImageKit (ensure your environment variables are set)

// export async function PUT(
//   req: NextRequest, // Use NextRequest for better type inference with formData
//   { params }: { params: { id: string } } // Get params directly from context
// ) {
//   await connectToDatabase();

//   const { id } = params; // params is already awaited by Next.js in route handlers

//   try {
//     // *** CRITICAL FIX: Parse formData instead of JSON ***
//     const formData = await req.formData();

//     // Get fields for updating an existing video
//     const videoIndexStr = formData.get("videoIndex") as string | null;
//     const videoName = formData.get("videoName") as string;
//     const videoDescription = formData.get("videoDescription") as string;
//     const videoUrl = formData.get("videoUrl") as string;
//     const videoImageFile = formData.get("videoImageFile") as File | null;
//     const currentVideoImageUrl = formData.get("currentVideoImageUrl") as string | null;

//     if (videoIndexStr === null) {
//       // This PUT endpoint is specifically for updating a video by index.
//       // If videoIndex is missing, it implies a different type of update,
//       // which this specific handler isn't designed for.
//       return NextResponse.json(
//         { success: false, message: "videoIndex is required for this update." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const videoIndex = parseInt(videoIndexStr, 10);

//     // Basic validation for video index
//     if (isNaN(videoIndex) || videoIndex < 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid video index provided for update." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const webinarToUpdate = await Certifications.findById(id);

//     if (!webinarToUpdate) {
//       return NextResponse.json(
//         { success: false, message: "Webinar not found." },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     // Check if video index is out of bounds after fetching the webinar
//     if (videoIndex >= webinarToUpdate.video.length) {
//         return NextResponse.json(
//             { success: false, message: "Video index out of bounds for the specified webinar." },
//             { status: 400, headers: corsHeaders }
//         );
//     }

//     const targetVideo = webinarToUpdate.video[videoIndex];

//     // Update specific video fields (only if provided in the formData)
//     if (videoName !== null) targetVideo.videoName = videoName; // formData.get returns null if not present
//     if (videoDescription !== null) targetVideo.videoDescription = videoDescription;
//     if (videoUrl !== null) targetVideo.videoUrl = videoUrl;

//     // Handle video thumbnail image update for the specific video
//     if (videoImageFile && videoImageFile.size > 0) {
//       // A new image file was uploaded for the thumbnail
//       const buffer = Buffer.from(await videoImageFile.arrayBuffer());
//       const uploadResponse = await imagekit.upload({
//         file: buffer,
//         fileName: `${uuidv4()}-${videoImageFile.name}`,
//         folder: "/webinars/video_thumbnails", // Specific folder for video thumbnails
//       });
//       targetVideo.videoImageUrl = uploadResponse.url;
//     } else if (currentVideoImageUrl !== null && currentVideoImageUrl !== 'null') {
//       // No new file, but an existing URL was provided by the client to keep
//       targetVideo.videoImageUrl = currentVideoImageUrl;
//     } else {
//       // If neither new file nor current URL (or 'null' string) is present, explicitly remove the image
//       targetVideo.videoImageUrl = ""; // Or `null` if your schema allows/prefers null
//     }

//     await webinarToUpdate.save();

//     return NextResponse.json(webinarToUpdate, {
//       status: 200,
//       headers: corsHeaders,
//     });

//   } catch (error: unknown) {
//     console.error("PUT /api/academy/webinars/[id] error:", error);

//     // Mongoose duplicate key error (if applicable for video sub-documents, though less common)
//     if (
//       typeof error === "object" &&
//       error !== null &&
//       "code" in error &&
//       (error as { code: number }).code === 11000
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "A unique constraint was violated.", // More generic message for sub-doc
//         },
//         { status: 409, headers: corsHeaders }
//       );
//     }

//     // Mongoose validation errors
//     if (
//       typeof error === "object" &&
//       error !== null &&
//       "name" in error &&
//       (error as { name: string }).name === "ValidationError" &&
//       "errors" in error
//     ) {
//       const validationErrors = (error as { errors: Record<string, { message: string }> }).errors;
//       const messages = Object.values(validationErrors).map((err) => err.message);
//       return NextResponse.json(
//         {
//           success: false,
//           message: `Validation Error: ${messages.join(", ")}`,
//         },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Generic internal server error
//     return NextResponse.json(
//       {
//         success: false,
//         message: (error as Error).message || "Internal Server Error",
//       },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }