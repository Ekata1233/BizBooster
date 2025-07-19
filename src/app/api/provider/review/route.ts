import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Provider from "@/models/Provider";
import ProviderReview from "@/models/ProviderReview";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const body = await req.json();
    const { userId, providerId, rating, comment } = body;

    if (!userId || !providerId || typeof rating !== "number") {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create review
    const newReview = await ProviderReview.create({
      user: userId,
      provider: providerId,
      rating,
      comment,
    });

    // Update provider's average rating and total reviews
    const allReviews = await ProviderReview.find({ provider: providerId });
    const avgRating =
      allReviews.reduce((acc, review) => acc + review.rating, 0) /
      allReviews.length;

    await Provider.findByIdAndUpdate(providerId, {
      averageRating: avgRating.toFixed(1),
      totalReviews: allReviews.length,
    });

    return NextResponse.json(
      { success: true, message: "Review posted successfully.", review: newReview },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("POST Review Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}


export async function GET() {
  await connectToDatabase();

  try {
    const reviews = await ProviderReview.find({});

    return NextResponse.json(
      { success: true, reviews },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("GET All Reviews Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch all reviews." },
      { status: 500, headers: corsHeaders }
    );
  }
}