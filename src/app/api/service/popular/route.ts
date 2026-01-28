

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
    const moduleId = searchParams.get("moduleId");

    if (moduleId && !mongoose.Types.ObjectId.isValid(moduleId)) {
  return NextResponse.json(
    { success: false, message: "Invalid moduleId" },
    { status: 400 }
  );
}

const categoryId = searchParams.get("categoryId");

if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
  return NextResponse.json(
    { success: false, message: "Invalid categoryId" },
    { status: 400 }
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
    ...(categoryId && {
      "category._id": new mongoose.Types.ObjectId(categoryId),
    }),
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
...(moduleId
  ? [
      {
        $match: {
          "module._id": new mongoose.Types.ObjectId(moduleId),
        },
      },
    ]
  : []),

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
          serviceDetails: { $first: "$service.serviceDetails" },
          franchiseDetails: {
      $first: {
        commission: "$service.franchiseDetails.commission",
        investmentRange: "$service.franchiseDetails.investmentRange",
        monthlyEarnPotential:
          "$service.franchiseDetails.monthlyEarnPotential",
          areaRequired: "$service.franchiseDetails.areaRequired",
            franchiseModel:
          "$service.franchiseDetails.franchiseModel", 
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
          serviceDetails: 1,
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

// export async function GET(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const { searchParams } = new URL(req.url);
//     const moduleId = searchParams.get("moduleId");

//     if (moduleId && !mongoose.Types.ObjectId.isValid(moduleId)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid moduleId" },
//         { status: 400 }
//       );
//     }

//     const isNoFilter = !moduleId;

//     /* =====================================================
//        🔹 COMMON PIPELINE (REVIEWS → SERVICES → MODULE)
//     ===================================================== */
//     const basePipeline: any[] = [
//       {
//         $lookup: {
//           from: "services",
//           localField: "service",
//           foreignField: "_id",
//           as: "service",
//         },
//       },
//       { $unwind: "$service" },

//       {
//         $match: {
//           "service.isDeleted": false,
//         },
//       },

//       {
//         $lookup: {
//           from: "categories",
//           localField: "service.category",
//           foreignField: "_id",
//           as: "category",
//         },
//       },
//       { $unwind: "$category" },

//       {
//         $match: {
//           "category.isDeleted": false,
//         },
//       },

//       {
//         $lookup: {
//           from: "modules",
//           localField: "category.module",
//           foreignField: "_id",
//           as: "module",
//         },
//       },
//       { $unwind: "$module" },
//     ];

//     /* =====================================================
//        🔹 CASE 2: MODULE FILTER (OLD BEHAVIOR)
//     ===================================================== */
//     if (!isNoFilter) {
//       const pipeline = [
//         ...basePipeline,

//         {
//           $match: {
//             "module._id": new mongoose.Types.ObjectId(moduleId),
//           },
//         },

//         {
//           $group: {
//             _id: "$service._id",
//             serviceName: { $first: "$service.serviceName" },
//             thumbnailImage: { $first: "$service.thumbnailImage" },
//             price: { $first: "$service.price" },
//             category: {
//               $first: {
//                 _id: "$category._id",
//                 name: "$category.name",
//               },
//             },
//             keyValues: { $first: "$service.keyValues" },
//             averageRating: { $avg: "$rating" },
//             totalReviews: { $sum: 1 },
//             packages: {
//               $first: "$service.serviceDetails.packages",
//             },
//             franchiseDetails: {
//               $first: {
//                 commission:
//                   "$service.franchiseDetails.commission",
//                 investmentRange:
//                   "$service.franchiseDetails.investmentRange",
//                 monthlyEarnPotential:
//                   "$service.franchiseDetails.monthlyEarnPotential",
//                 franchiseModel:
//                   "$service.franchiseDetails.franchiseModel",
//               },
//             },
//           },
//         },

//         {
//           $sort: {
//             averageRating: -1,
//             totalReviews: -1,
//           },
//         },

//         { $limit: 10 },

//         {
//           $project: {
//             _id: 0,
//             serviceId: "$_id",
//             serviceName: 1,
//             thumbnailImage: 1,
//             price: 1,
//             averageRating: { $round: ["$averageRating", 1] },
//             totalReviews: 1,
//             category: 1,
//             packages: 1,
//             keyValues: 1,
//             franchiseDetails: 1,
//           },
//         },
//       ];

//       const data = await Review.aggregate(pipeline);

//       return NextResponse.json(
//         { success: true, count: data.length, data },
//         { status: 200, headers: corsHeaders }
//       );
//     }

//     /* =====================================================
//        🔹 CASE 1: NO FILTER → ROUND ROBIN
//     ===================================================== */
//     const roundRobinPipeline: any[] = [
//       ...basePipeline,

//       /* Group reviews → services */
//       {
//         $group: {
//           _id: "$service._id",
//           serviceName: { $first: "$service.serviceName" },
//           thumbnailImage: { $first: "$service.thumbnailImage" },
//           price: { $first: "$service.price" },
//           category: {
//             $first: {
//               _id: "$category._id",
//               name: "$category.name",
//             },
//           },
//           moduleId: { $first: "$module._id" },
//           keyValues: { $first: "$service.keyValues" },
//           averageRating: { $avg: "$rating" },
//           totalReviews: { $sum: 1 },
//           packages: {
//             $first: "$service.serviceDetails.packages",
//           },
//           franchiseDetails: {
//             $first: {
//               commission:
//                 "$service.franchiseDetails.commission",
//               investmentRange:
//                 "$service.franchiseDetails.investmentRange",
//               monthlyEarnPotential:
//                 "$service.franchiseDetails.monthlyEarnPotential",
//               franchiseModel:
//                 "$service.franchiseDetails.franchiseModel",
//             },
//           },
//         },
//       },

//       /* Sort inside module */
//       {
//         $sort: {
//           moduleId: 1,
//           averageRating: -1,
//           totalReviews: -1,
//         },
//       },

//       /* Group by module */
//       {
//         $group: {
//           _id: "$moduleId",
//           services: { $push: "$$ROOT" },
//         },
//       },

//       {
//         $project: {
//           services: 1,
//           size: { $size: "$services" },
//         },
//       },

//       {
//         $group: {
//           _id: null,
//           modules: { $push: "$services" },
//           maxLen: { $max: "$size" },
//         },
//       },

//       /* Interleave */
//       {
//         $project: {
//           services: {
//             $filter: {
//               input: {
//                 $reduce: {
//                   input: { $range: [0, "$maxLen"] },
//                   initialValue: [],
//                   in: {
//                     $concatArrays: [
//                       "$$value",
//                       {
//                         $map: {
//                           input: "$modules",
//                           as: "m",
//                           in: {
//                             $arrayElemAt: ["$$m", "$$this"],
//                           },
//                         },
//                       },
//                     ],
//                   },
//                 },
//               },
//               as: "s",
//               cond: { $ne: ["$$s", null] },
//             },
//           },
//         },
//       },

//       { $unwind: "$services" },
//       { $replaceRoot: { newRoot: "$services" } },

//       { $limit: 10 },

//       {
//         $project: {
//           _id: 0,
//           serviceId: "$_id",
//           serviceName: 1,
//           thumbnailImage: 1,
//           price: 1,
//           averageRating: { $round: ["$averageRating", 1] },
//           totalReviews: 1,
//           category: 1,
//           packages: 1,
//           keyValues: 1,
//           franchiseDetails: 1,
//         },
//       },
//     ];

//     const data = await Review.aggregate(roundRobinPipeline);

//     return NextResponse.json(
//       { success: true, count: data.length, data },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Failed to fetch services",
//       },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }