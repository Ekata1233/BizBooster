import User from "@/models/User";
import { connectToDatabase } from "@/utils/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import "@/models/Service";


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    // ✅ Validate user ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Valid user ID is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Find user and populate favoriteServices
const user = await User.findById(id)
  .populate({
    path: 'favoriteServices',
    select: `
      serviceDetails.packages
      franchiseDetails
      serviceName
      category
      subcategory
      price
      discount
      gst
      includeGst
      gstInRupees
      totalWithGst
      discountedPrice
      providerPrices
      thumbnailImage
      bannerImages
      tags
      keyValues
      averageRating
      totalReviews
      recommendedServices
      isTrending
    `
  });


    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: user.favoriteServices },
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
