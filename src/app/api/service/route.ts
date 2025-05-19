import { NextRequest, NextResponse } from 'next/server';
import Service from '@/models/Service';
import imagekit from '@/utils/imagekit';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/utils/db';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const serviceName = formData.get('serviceName') as string;
    const category = formData.get('category') as string;
    const subcategory = formData.get('subcategory') as string;
    const price = parseFloat(formData.get('price') as string);

    if (!serviceName || !category || !subcategory || isNaN(price)) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Handle thumbnail image upload
    const thumbnailFile = formData.get('thumbnailImage') as File;
    let thumbnailImageUrl = '';
    if (thumbnailFile) {
      const arrayBuffer = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${thumbnailFile.name}`,
        folder: '/uploads',
      });

      thumbnailImageUrl = uploadResponse.url;
    }

    // Handle banner images upload
    const bannerFiles = formData.getAll('bannerImages') as File[];
    const bannerImageUrls: string[] = [];

    for (const file of bannerFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${file.name}`,
        folder: '/uploads',
      });

      bannerImageUrls.push(uploadResponse.url);
    }

    // Parse serviceDetails and franchiseDetails
    const serviceDetails = JSON.parse(formData.get('serviceDetails') as string);
    const franchiseDetails = JSON.parse(formData.get('franchiseDetails') as string);

    // Create new service document
    const newService = await Service.create({
      serviceName,
      category,
      subcategory,
      price,
      thumbnailImage: thumbnailImageUrl,
      bannerImages: bannerImageUrls,
      serviceDetails,
      franchiseDetails,
    });

    return NextResponse.json({ success: true, data: newService }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

export async function GET() {
  await connectToDatabase();

  try {
    const services = await Service.find({ isDeleted: false })
      .populate("category")
      .populate("subcategory");

    return NextResponse.json(
      { success: true, data: services },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}