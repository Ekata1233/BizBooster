

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

// export async function GET(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const { searchParams } = new URL(req.url);
//     const moduleId = searchParams.get("moduleId");

//     if (!moduleId || !mongoose.Types.ObjectId.isValid(moduleId)) {
//       return NextResponse.json(
//         { success: false, message: "Valid moduleId is required" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const data = await Review.aggregate([
//       /* -------------------------------------------
//          Join Service
//       -------------------------------------------- */
//       {
//         $lookup: {
//           from: "services",
//           localField: "service",
//           foreignField: "_id",
//           as: "service",
//         },
//       },
//       { $unwind: "$service" },

//       /* -------------------------------------------
//          Join Category
//       -------------------------------------------- */
//       {
//         $lookup: {
//           from: "categories",
//           localField: "service.category",
//           foreignField: "_id",
//           as: "category",
//         },
//       },
//       { $unwind: "$category" },

//       /* -------------------------------------------
//          Join Module
//       -------------------------------------------- */
//       {
//         $lookup: {
//           from: "modules",
//           localField: "category.module",
//           foreignField: "_id",
//           as: "module",
//         },
//       },
//       { $unwind: "$module" },

//       /* -------------------------------------------
//          Filter by module name
//       -------------------------------------------- */
//      {
//   $match: {
//     $expr: {
//       $eq: [
//         {
//           $toLower: {
//             $replaceAll: {
//               input: "$module.name",
//               find: " ",
//               replacement: "",
//             },
//           },
//         },
//         {
//           $toLower: {
//             $replaceAll: {
//               input: moduleName,
//               find: " ",
//               replacement: "",
//             },
//           },
//         },
//       ],
//     },
//     "service.isDeleted": false,
//     "category.isDeleted": false,
//   },
// }
// ,

//       /* -------------------------------------------
//          Group by service
//       -------------------------------------------- */
//       {
//         $group: {
//           _id: "$service._id",
//           serviceName: { $first: "$service.serviceName" },
//           thumbnailImage: { $first: "$service.thumbnailImage" },
//           price: { $first: "$service.price" },
//           category: { $first: "$category" },
//           avgRating: { $avg: "$rating" },
//           totalReviews: { $sum: 1 },
//         },
//       },

//       /* -------------------------------------------
//          Sort & Limit
//       -------------------------------------------- */
//       {
//         $sort: {
//           avgRating: -1,
//           totalReviews: -1,
//         },
//       },
//       { $limit: 10 },

//       /* -------------------------------------------
//          Final Shape
//       -------------------------------------------- */
//       {
//         $project: {
//           _id: 0,
//           serviceId: "$_id",
//           serviceName: 1,
//           thumbnailImage: 1,
//           price: 1,
//           avgRating: { $round: ["$avgRating", 1] },
//           totalReviews: 1,
//           category: {
//             _id: "$category._id",
//             name: "$category.name",
//           },
//         },
//       },
//     ]);

//     return NextResponse.json(
//       {
//         success: true,
//         count: data.length,
//         data,
//       },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Failed to fetch popular services",
//       },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

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
      /* ---------------- REVIEW → SERVICE ---------------- */
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },

      /* ---------------- SERVICE FILTER ---------------- */
      {
        $match: {
          "service.isDeleted": false,
        },
      },

      /* ---------------- SERVICE → CATEGORY ---------------- */
      {
        $lookup: {
          from: "categories",
          localField: "service.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },

      {
        $match: {
          "category.isDeleted": false,
        },
      },

      /* ---------------- CATEGORY → MODULE ---------------- */
      {
        $lookup: {
          from: "modules",
          localField: "category.module",
          foreignField: "_id",
          as: "module",
        },
      },
      { $unwind: "$module" },

      /* ---------------- MODULE FILTER ---------------- */
      {
        $match: {
          "module._id": new mongoose.Types.ObjectId(moduleId),
        },
      },

      /* ---------------- GROUP BY SERVICE ---------------- */
      {
        $group: {
          _id: "$service._id",
          serviceName: { $first: "$service.serviceName" },
          thumbnailImage: { $first: "$service.thumbnailImage" },
          price: { $first: "$service.price" },
          category: {
            $first: {
              _id: "$category._id",
              name: "$category.name",
            },
          },
            keyValues: { $first: "$service.keyValues" },
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          packages: { $first: "$service.serviceDetails.packages" },
          franchiseDetails: {
      $first: {
        commission: "$service.franchiseDetails.commission",
        investmentRange: "$service.franchiseDetails.investmentRange",
        monthlyEarnPotential:
          "$service.franchiseDetails.monthlyEarnPotential",
      },
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
          serviceId: "$_id",
          serviceName: 1,
          thumbnailImage: 1,
          price: 1,
          averageRating: { $round: ["$averageRating", 1] },
          totalReviews: 1,
          category: 1,
          packages: 1,
          keyValues: 1,
           franchiseDetails: 1,
        },
      },
    ];

    const data = await Review.aggregate(pipeline);

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
        message: error.message || "Failed to fetch services",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

