// import { NextRequest, NextResponse } from "next/server";
// import mongoose from "mongoose";
// import Service from "@/models/Service";
// import Review from "@/models/Review";
// import { connectToDatabase } from "@/utils/db";

// import "@/models/Category";
// import "@/models/Subcategory";
// import "@/models/Provider";

// export const runtime = "nodejs";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function GET(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const topRatedServices = await Review.aggregate([
//       // Group reviews by service
//       {
//         $group: {
//           _id: "$service",
//           avgRating: { $avg: "$rating" },
//           totalReviews: { $sum: 1 },
//         },
//       },

//       // Sort by rating & reviews
//       {
//         $sort: {
//           avgRating: -1,
//           totalReviews: -1,
//         },
//       },

//       // Limit to top 10
//       {
//         $limit: 10,
//       },

//       // Join with Service collection
//       {
//         $lookup: {
//           from: "services",
//           localField: "_id",
//           foreignField: "_id",
//           as: "service",
//         },
//       },

//       // Convert array → object
//       { $unwind: "$service" },

//       // Optional: exclude deleted services
//       {
//         $match: {
//           "service.isDeleted": false,
//         },
//       },

//       // Shape final response
//       {
//         $project: {
//           _id: 0,
//           serviceId: "$service._id",
//           serviceName: "$service.serviceName",
//           thumbnailImage: "$service.thumbnailImage",
//           bannerImages: "$service.bannerImages",
//           price: "$service.price",
//           category: "$service.category",
//           subcategory: "$service.subcategory",
//           avgRating: { $round: ["$avgRating", 1] },
//           totalReviews: 1,
//         },
//       },
//     ]);

//     return NextResponse.json(
//       {
//         success: true,
//         count: topRatedServices.length,
//         data: topRatedServices,
//       },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Failed to fetch top rated services",
//       },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Review from "@/models/Review";
import { connectToDatabase } from "@/utils/db";

import "@/models/Service";
import "@/models/Category";
import "@/models/Module";

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
    const moduleName = searchParams.get("modulename");

    if (!moduleName) {
      return NextResponse.json(
        { success: false, message: "modulename is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const data = await Review.aggregate([
      /* -------------------------------------------
         Join Service
      -------------------------------------------- */
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },

      /* -------------------------------------------
         Join Category
      -------------------------------------------- */
      {
        $lookup: {
          from: "categories",
          localField: "service.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },

      /* -------------------------------------------
         Join Module
      -------------------------------------------- */
      {
        $lookup: {
          from: "modules",
          localField: "category.module",
          foreignField: "_id",
          as: "module",
        },
      },
      { $unwind: "$module" },

      /* -------------------------------------------
         Filter by module name
      -------------------------------------------- */
     {
  $match: {
    $expr: {
      $eq: [
        {
          $toLower: {
            $replaceAll: {
              input: "$module.name",
              find: " ",
              replacement: "",
            },
          },
        },
        {
          $toLower: {
            $replaceAll: {
              input: moduleName,
              find: " ",
              replacement: "",
            },
          },
        },
      ],
    },
    "service.isDeleted": false,
    "category.isDeleted": false,
  },
}
,

      /* -------------------------------------------
         Group by service
      -------------------------------------------- */
      {
        $group: {
          _id: "$service._id",
          serviceName: { $first: "$service.serviceName" },
          thumbnailImage: { $first: "$service.thumbnailImage" },
          price: { $first: "$service.price" },
          category: { $first: "$category" },
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },

      /* -------------------------------------------
         Sort & Limit
      -------------------------------------------- */
      {
        $sort: {
          avgRating: -1,
          totalReviews: -1,
        },
      },
      { $limit: 10 },

      /* -------------------------------------------
         Final Shape
      -------------------------------------------- */
      {
        $project: {
          _id: 0,
          serviceId: "$_id",
          serviceName: 1,
          thumbnailImage: 1,
          price: 1,
          avgRating: { $round: ["$avgRating", 1] },
          totalReviews: 1,
          category: {
            _id: "$category._id",
            name: "$category.name",
          },
        },
      },
    ]);

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
        message: error.message || "Failed to fetch popular services",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
