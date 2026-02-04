
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import "@/models/User";
import "@/models/Provider";
import ProviderReview from "@/models/ProviderReview";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); 

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing provider ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch reviews for this provider
    const reviews = await ProviderReview.find({ provider: id })
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    // Count ratings (1-5)
    const ratingCounts: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let ratingSum = 0;

    reviews.forEach((review) => {
      const rating = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5;
      ratingSum += review.rating;

      if (ratingCounts[rating] !== undefined) {
        ratingCounts[rating] += 1;
      }
    });

    const averageRating =
      reviews.length > 0 ? parseFloat((ratingSum / reviews.length).toFixed(1)) : 0;

    return NextResponse.json(
      {
        success: true,
        totalReviews: reviews.length,
        averageRating,
        ratingDistribution: ratingCounts,
        reviews,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
