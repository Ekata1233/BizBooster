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


export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    console.log("formdata of advisro  : ", formData);

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

    /* ----------------- NAME VALIDATION ----------------- */
    if (!/^[A-Za-z\s]{2,50}$/.test(name)) {
      return NextResponse.json(
        { success: false, message: "Name must be 2-50 characters and contain only letters and spaces." },
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

    /* ----------------- LANGUAGE VALIDATION ----------------- */
    if (!/^[A-Za-z\s]{2,30}$/.test(language)) {
      return NextResponse.json(
        { success: false, message: "Language must be 2-30 characters and contain only letters." },
        { status: 400, headers: corsHeaders }
      );
    }

    /* ----------------- RATING VALIDATION ----------------- */
    if (isNaN(rating) || rating < 0 || rating > 5 || !/^\d+(\.\d)?$/.test(ratingRaw)) {
      return NextResponse.json(
        { success: false, message: "Rating must be a number between 0 and 5, with max 1 decimal." },
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
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageUrl.type)) {
      return NextResponse.json(
        { success: false, message: "Image must be JPEG, JPG, PNG, or WEBP format." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (imageUrl.size > 1024 * 1024) { // 1 MB
      return NextResponse.json(
        { success: false, message: "Image size must be less than 1 MB." },
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