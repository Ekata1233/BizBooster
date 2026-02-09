import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Review from "@/models/Review";
import Service from "@/models/Service";
import Checkout from "@/models/Checkout";

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
    const { userId, serviceId, rating, comment,checkoutId , isSkip } = body;

    /* ----------------------------------------
       CASE 2: SKIP REVIEW
    ---------------------------------------- */
    if (checkoutId && isSkip === true) {
      const checkout = await Checkout.findByIdAndUpdate(
        checkoutId,
        { isSkip: true },
        { new: true }
      );

      if (!checkout) {
        return NextResponse.json(
          { success: false, message: "Checkout not found" },
          { status: 404, headers: corsHeaders }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Review skipped successfully",
        },
        { status: 200, headers: corsHeaders }
      );
    }



    if (!userId || !serviceId || typeof rating !== "number") {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create review
    const newReview = await Review.create({
      user: userId,
      service: serviceId,
      rating,
      comment,
    });

    // Update service's average rating and total reviews
    const allReviews = await Review.find({ service: serviceId });
    const avgRating =
      allReviews.reduce((acc, review) => acc + review.rating, 0) /
      allReviews.length;

    await Service.findByIdAndUpdate(serviceId, {
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
    const reviews = await Review.find({});

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