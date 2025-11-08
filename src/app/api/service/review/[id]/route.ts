// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/utils/db";
// import Review from "@/models/Review";
// import "@/models/User"; // Ensure User model is loaded for populate
// import "@/models/Service"; // Optional if not auto-loaded

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function GET(req: Request) {
//   await connectToDatabase();

//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop(); // last segment is serviceId

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: "Missing service ID parameter." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const reviews = await Review.find({ service: id })
//       .populate("user", "name email") // Include user's basic info
//       .sort({ createdAt: -1 });

//     if (!reviews || reviews.length === 0) {
//       return NextResponse.json(
//         { success: true, message: "No reviews found for this service.", reviews: [] },
//         { status: 200, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       { success: true, reviews },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     const message =
//       error instanceof Error ? error.message : "An unknown error occurred";
//     return NextResponse.json(
//       { success: false, message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/utils/db";
// import Review from "@/models/Review";
// import "@/models/User";
// import "@/models/Service";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function GET(req: Request) {
//   await connectToDatabase();

//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop(); // serviceId from URL

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: "Missing service ID parameter." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Fetch reviews for this service
//     const reviews = await Review.find({ service: id })
//       .populate("user", "name email")
//       .sort({ createdAt: -1 });

//     // Count ratings (1-5)
//     const ratingCounts: Record<1 | 2 | 3 | 4 | 5, number> = {
//       1: 0,
//       2: 0,
//       3: 0,
//       4: 0,
//       5: 0,
//     };

//     reviews.forEach((review) => {
//       const rating = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5;
//       if (ratingCounts[rating] !== undefined) {
//         ratingCounts[rating] += 1;
//       }
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         totalReviews: reviews.length,
//         ratingDistribution: ratingCounts,
//         reviews,
//       },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     const message =
//       error instanceof Error ? error.message : "An unknown error occurred";
//     return NextResponse.json(
//       { success: false, message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Review from "@/models/Review";
import "@/models/User";
import "@/models/Service";

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
    const id = url.pathname.split("/").pop(); // serviceId from URL

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing service ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch reviews for this service
    const reviews = await Review.find({ service: id })
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
