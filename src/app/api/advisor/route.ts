import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import imagekit from '@/utils/imagekit';
import { v4 as uuidv4 } from "uuid";
import Advisor from '@/models/Advisor';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// export async function POST(req: NextRequest) {
//     await connectToDatabase();

//     try {
//         const formData = await req.formData();

//         console.log("Form Data of Advisor: ", formData)
//         const name = formData.get("name") as string;
//         const ratingRaw = formData.get("rating") as string;
// const rating = Number(ratingRaw);
        
//         // Corrected line: Use getAll instead of get
//         const rawTags = formData.getAll("tags") as string[]; 
//         const tags = rawTags
//             .map(tag => tag.trim())
//             .filter(tag => tag.length > 0);

//         const language = formData.get("language") as string;
//         const phoneNumber = formData.get("phoneNumber") as string;
//         const chat = formData.get("chat") as string;

        
//         const imageUrl = formData.get("imageUrl") as File;
//         if (!imageUrl || imageUrl.size === 0) {
//             return NextResponse.json(
//                 { success: false, message: "Main image file is required for a advisor data." },
//                 { status: 400, headers: corsHeaders }
//             );
//         }

//         const mainImageBuffer = Buffer.from(await imageUrl.arrayBuffer());
//         const mainImageUploadResponse = await imagekit.upload({
//             file: mainImageBuffer,
//             fileName: `${uuidv4()}-${imageUrl.name}`,
//             folder: "/advisors/main_images",
//         });
//         const mainImageUrlString: string = mainImageUploadResponse.url;

//         // Phone number validation
// if (!/^\d{10}$/.test(phoneNumber)) {
//   return NextResponse.json(
//     { success: false, message: "Phone number must be numeric and exactly 10 digits." },
//     { status: 400, headers: corsHeaders }
//   );
// }

// // Rating validation
// if (isNaN(rating)) {
//   return NextResponse.json(
//     { success: false, message: "Rating must be a numeric value." },
//     { status: 400, headers: corsHeaders }
//   );
// }

// // Tags validation
// if (!Array.isArray(tags) || tags.length === 0) {
//   return NextResponse.json(
//     { success: false, message: "At least one tag is required." },
//     { status: 400, headers: corsHeaders }
//   );
// }



//         if (!name || !rating || tags.length === 0 || !imageUrl || !phoneNumber || !chat || !language) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Name, Rating, tags, image, phoneNumber, chat, language are required.",
//                 },
//                 { status: 400, headers: corsHeaders }
//             );
//         }


//         const newAdvisor = await Advisor.create({
//             name,
//             tags,
//             imageUrl: mainImageUrlString,
//             language,
//             chat, rating, phoneNumber

//         });

//         return NextResponse.json({ success: true, data: newAdvisor }, { 
//             status: 201,
//             headers: corsHeaders,
//         });

//     } catch (error: unknown) {
//         console.error("POST /api/webinars error:", error);
//         if (
//             typeof error === "object" &&
//             error !== null &&
//             "code" in error &&
//             (error as { code: number }).code === 11000
//         ) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Tutorial name must be unique.",
//                 },
//                 { status: 409, headers: corsHeaders }
//             );
//         }
//         if (
//             typeof error === "object" &&
//             error !== null &&
//             "name" in error &&
//             (error as { name: string }).name === "ValidationError" &&
//             "errors" in error
//         ) {
//             const validationErrors = (error as { errors: Record<string, { message: string }> }).errors;
//             const messages = Object.values(validationErrors).map((err) => err.message);
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: `Validation Error: ${messages.join(", ")}`,
//                 },
//                 { status: 400, headers: corsHeaders }
//             );
//         }
//         return NextResponse.json(
//             {
//                 success: false,
//                 message: (error as Error).message || "Internal Server Error",
//             },
//             { status: 500, headers: corsHeaders }
//         );
//     }
// }

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const ratingRaw = formData.get("rating") as string;
    const rating = Number(ratingRaw);

    const rawTags = formData.getAll("tags") as string[];
    const tags = rawTags.map(t => t.trim()).filter(Boolean);

    const language = formData.get("language") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const chat = formData.get("chat") as string;
    const imageUrl = formData.get("imageUrl") as File;

    /* ----------------- BASIC REQUIRED CHECK ----------------- */
    if (!name || !language || !chat || !phoneNumber || !imageUrl) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400, headers: corsHeaders }
      );
    }

    /* ----------------- PHONE VALIDATION ----------------- */
    if (!/^\d{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { success: false, message: "Phone number must be numeric and exactly 10 digits." },
        { status: 400, headers: corsHeaders }
      );
    }

    /* ----------------- RATING VALIDATION ----------------- */
    if (isNaN(rating) || rating < 0 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be a number between 0 and 5." },
        { status: 400, headers: corsHeaders }
      );
    }

    /* ----------------- TAGS VALIDATION ----------------- */
    if (tags.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one tag is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    /* ----------------- IMAGE VALIDATION ----------------- */
    if (imageUrl.size === 0) {
      return NextResponse.json(
        { success: false, message: "Image file is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    /* ----------------- IMAGE UPLOAD ----------------- */
    const mainImageBuffer = Buffer.from(await imageUrl.arrayBuffer());

    const uploadResponse = await imagekit.upload({
      file: mainImageBuffer,
      fileName: `${uuidv4()}-${imageUrl.name}`,
      folder: "/advisors/main_images",
    });

    /* ----------------- SAVE TO DB ----------------- */
    const newAdvisor = await Advisor.create({
      name,
      rating,
      tags,
      phoneNumber,
      language,
      chat,
      imageUrl: uploadResponse.url,
    });

    return NextResponse.json(
      { success: true, data: newAdvisor },
      { status: 201, headers: corsHeaders }
    );

  } catch (error: unknown) {
    console.error("POST /api/advisor error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}



export async function GET() {
    await connectToDatabase()

    try {
        const advisorsData = await Advisor.find({})
        return NextResponse.json({
            success: true, data: advisorsData,
            status: 201, headers: corsHeaders
        })
    }
    catch (error: unknown) {
        console.log(`api/advisor failed to return data`, error)
        return NextResponse.json(
            { success: false, message: (error as Error).message || "Internal Server Error" },
            { status: 500, headers: corsHeaders }
        )
    }
}