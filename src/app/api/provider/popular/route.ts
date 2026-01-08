import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import "@/models/ProviderReview"


export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");

    if (!moduleId || !mongoose.Types.ObjectId.isValid(moduleId)) {
      return NextResponse.json(
        { success: false, message: "Valid moduleId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const pipeline: any[] = [
      /* ---------------- PROVIDER FILTER ---------------- */
      {
        $match: {
          isDeleted: false,
          isApproved: true,
          "storeInfo.module": new mongoose.Types.ObjectId(moduleId),
        },
      },

      /* ---------------- PROVIDER → REVIEWS ---------------- */
      {
        $lookup: {
          from: "providerreviews",
          localField: "_id",
          foreignField: "provider",
          as: "reviews",
        },
      },

      /* ---------------- ADD RATING FIELDS ---------------- */
      {
        $addFields: {
          averageRating: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $avg: "$reviews.rating" },
              0,
            ],
          },
          totalReviews: { $size: "$reviews" },
        },
      },
/* ---------------- PROVIDER → SERVICES ---------------- */
{
  $lookup: {
    from: "services",
    localField: "subscribedServices",
    foreignField: "_id",
    as: "services",
  },
},

/* ---------------- SERVICE → CATEGORY ---------------- */
{
  $lookup: {
    from: "categories",
    localField: "services.category",
    foreignField: "_id",
    as: "categories",
  },
},

/* ---------------- CATEGORY LIST ---------------- */
{
  $addFields: {
    category_list: {
      $setUnion: ["$categories.name"],
    },
  },
},

      /* ---------------- SORT ---------------- */
      {
        $sort: {
          averageRating: -1,
          totalReviews: -1,
        },
      },

      { $limit: 10 },

      /* ---------------- FINAL SHAPE ---------------- */
      {
        $project: {
          _id: 0,
          providerId: "$_id",

          fullName: 1,
          phoneNo: 1,
          email: 1,
          averageRating: { $round: ["$averageRating", 1] },
          totalReviews: 1,
          isStoreOpen: 1,
          category_list: 1,
          storeInfo: {
            storeName: "$storeInfo.storeName",
            storePhone: "$storeInfo.storePhone",
            storeEmail: "$storeInfo.storeEmail",
            module: "$storeInfo.module",
            zone: "$storeInfo.zone",
            logo: "$storeInfo.logo",
            cover: "$storeInfo.cover",
            address: "$storeInfo.address",
            city: "$storeInfo.city",
            state: "$storeInfo.state",
            country: "$storeInfo.country",
            aboutUs: "$storeInfo.aboutUs",
            tags: "$storeInfo.tags",
            totalProjects: "$storeInfo.totalProjects",
            totalExperience: "$storeInfo.totalExperience",
          },
        },
      },
    ];

    const data = await Provider.aggregate(pipeline);

    return NextResponse.json(
      {
        success: true,
        count: data.length,
        data,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch providers",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
