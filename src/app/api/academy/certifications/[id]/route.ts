import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import Certifications from "@/models/Certifications";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// export async function GET(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop();

//     if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid Certification ID format." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const certification = await Certifications.findById(id);

//     if (!certification) {
//       return NextResponse.json(
//         { success: false, message: "Certification not found." },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       { success: true, data: certification },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: error instanceof Error ? error.message : "Internal Server Error",
//       },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


// export async function PUT(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop();

//     const formData = await req.formData();

//     const certificationToUpdate = await Certifications.findById(id);

//     if (!certificationToUpdate) {
//       return NextResponse.json(
//         { success: false, message: "Certification not found." },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     const videoIndexStr = formData.get("videoIndex") as string | null;

//     if (videoIndexStr !== null) {
//       // =============== SCENARIO 1: Update a specific video ===============
//       const videoIndex = Number(videoIndexStr);

//       if (isNaN(videoIndex) || videoIndex < 0 || videoIndex >= certificationToUpdate.video.length) {
//         return NextResponse.json(
//           { success: false, message: "Invalid video index." },
//           { status: 400, headers: corsHeaders }
//         );
//       }

//       const targetVideo = certificationToUpdate.video[videoIndex];
//       const videoName = formData.get("videoName") as string;
//       const videoDescription = formData.get("videoDescription") as string;
//       const videoUrl = formData.get("videoUrl") as string;
//       const videoImageFile = formData.get("videoImageFile") as File | null;
//       const currentVideoImageUrl = formData.get("currentVideoImageUrl") as string | null;

//       if (videoName !== null) targetVideo.videoName = videoName;
//       if (videoDescription !== null) targetVideo.videoDescription = videoDescription;
//       if (videoUrl !== null) targetVideo.videoUrl = videoUrl;

//       if (videoImageFile && videoImageFile.size > 0) {
//         const buffer = Buffer.from(await videoImageFile.arrayBuffer());
//         const uploadResponse = await imagekit.upload({
//           file: buffer,
//           fileName: `${uuidv4()}-${videoImageFile.name}`,
//           folder: "/certifications/video_thumbnails",
//         });
//         targetVideo.videoImageUrl = uploadResponse.url;
//       } else if (currentVideoImageUrl !== null && currentVideoImageUrl !== "null") {
//         targetVideo.videoImageUrl = currentVideoImageUrl;
//       } else {
//         targetVideo.videoImageUrl = "";
//       }

//       await certificationToUpdate.save();

//       return NextResponse.json(certificationToUpdate, {
//         status: 200,
//         headers: corsHeaders,
//       });
//     } else {
//       // =============== SCENARIO 2: Update main data and/or add new videos ===============
//       const name = formData.get("name") as string;
//       const description = formData.get("description") as string;
//       const mainImageFile = formData.get("imageUrl") as File | null;
//       const currentMainImageUrl = formData.get("currentImageUrl") as string | null;

//       if (name !== null) certificationToUpdate.name = name;
//       if (description !== null) certificationToUpdate.description = description;

//       if (mainImageFile && mainImageFile.size > 0) {
//         const buffer = Buffer.from(await mainImageFile.arrayBuffer());
//         const uploadResponse = await imagekit.upload({
//           file: buffer,
//           fileName: `${uuidv4()}-${mainImageFile.name}`,
//           folder: "/certifications/main_images",
//         });
//         certificationToUpdate.imageUrl = uploadResponse.url;
//       } else if (currentMainImageUrl !== null && currentMainImageUrl !== "null") {
//         certificationToUpdate.imageUrl = currentMainImageUrl;
//       } else if (!certificationToUpdate.imageUrl) {
//         return NextResponse.json(
//           { success: false, message: "Main image is required." },
//           { status: 400, headers: corsHeaders }
//         );
//       } else {
//         certificationToUpdate.imageUrl = "";
//       }

//       const newVideos = [];
//       let i = 0;

//       while (
//         formData.has(`newVideos[${i}][videoName]`) ||
//         formData.has(`newVideos[${i}][videoDescription]`) ||
//         formData.has(`newVideos[${i}][videoUrl]`) ||
//         formData.has(`newVideos[${i}][videoImageUrl]`)
//       ) {
//         const videoName = formData.get(`newVideos[${i}][videoName]`) as string;
//         const videoDescription = formData.get(`newVideos[${i}][videoDescription]`) as string;
//         const videoUrl = formData.get(`newVideos[${i}][videoUrl]`) as string;
//         const videoImageFile = formData.get(`newVideos[${i}][videoImageUrl]`) as File | null;

//         let videoImageUrl: string | undefined;

//         if (videoImageFile && videoImageFile.size > 0) {
//           const buffer = Buffer.from(await videoImageFile.arrayBuffer());
//           const uploadResponse = await imagekit.upload({
//             file: buffer,
//             fileName: `${uuidv4()}-${videoImageFile.name}`,
//             folder: "/certifications/video_thumbnails",
//           });
//           videoImageUrl = uploadResponse.url;
//         }

//         if (!videoUrl || !videoName || !videoDescription) {
//           if (videoUrl || videoName || videoDescription || videoImageFile) {
//             return NextResponse.json(
//               { success: false, message: `All fields required for video ${i + 1}.` },
//               { status: 400, headers: corsHeaders }
//             );
//           }
//         } else {
//           newVideos.push({
//             videoName,
//             videoDescription,
//             videoUrl,
//             ...(videoImageUrl && { videoImageUrl }),
//           });
//         }

//         i++;
//       }

//       certificationToUpdate.video.push(...newVideos);

//       if (certificationToUpdate.video.length === 0) {
//         return NextResponse.json(
//           { success: false, message: "At least one video is required." },
//           { status: 400, headers: corsHeaders }
//         );
//       }

//       await certificationToUpdate.save();

//       return NextResponse.json(certificationToUpdate, {
//         status: 200,
//         headers: corsHeaders,
//       });
//     }
//   }catch (error: unknown) { // Use 'unknown' for better type safety
//     console.error("PUT error:", error);

//     // Mongoose duplicate key error (11000)
//     if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
//       return NextResponse.json(
//         { success: false, message: "Certification name must be unique." },
//         { status: 409, headers: corsHeaders }
//       );
//     }
    
//     // Mongoose validation error
//     if (error instanceof mongoose.Error.ValidationError) {
//         const messages = Object.values(error.errors).map((e) => e.message);
//         return NextResponse.json(
//             { success: false, message: messages.join(", ") },
//             { status: 400, headers: corsHeaders }
//         );
//     }

//     // Generic error handling
//     return NextResponse.json(
//       { success: false, message: error instanceof Error ? error.message : "Internal Server Error" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

// export async function DELETE(req: Request) {
//   await connectToDatabase();

//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop();

//     if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid Certification ID format." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const deleted = await Certifications.findByIdAndDelete(id);

//     if (!deleted) {
//       return NextResponse.json(
//         { success: false, message: "Certification not found." },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Certification deleted successfully.",
//         data: deleted,
//       },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: error instanceof Error ? error.message : "Internal Server Error",
//       },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }
