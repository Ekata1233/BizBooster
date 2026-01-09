import { NextRequest, NextResponse } from "next/server";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import mongoose from "mongoose";
import "@/models/Category"
import "@/models/Subcategory"
import "@/models/Provider"
export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const removeEmpty = (value: any): any => {
  // ✅ keep ObjectId & Date untouched
  if (
    value instanceof mongoose.Types.ObjectId ||
    value instanceof Date
  ) {
    return value;
  }

  // remove empty string
  if (value === "") return undefined;

  // handle arrays
  if (Array.isArray(value)) {
    const cleanedArray = value
      .map(removeEmpty)
      .filter(v => v !== undefined);

    return cleanedArray.length > 0 ? cleanedArray : undefined;
  }

  // handle objects
  if (typeof value === "object" && value !== null) {
    const cleanedObject: any = {};

    for (const key in value) {
      const cleanedValue = removeEmpty(value[key]);

      if (cleanedValue !== undefined) {
        cleanedObject[key] = cleanedValue;
      }
    }

    return Object.keys(cleanedObject).length > 0 ? cleanedObject : undefined;
  }

  // keep numbers, booleans, valid strings
  return value;
};


export async function GET(req: NextRequest) {
    await connectToDatabase();
  
    try {
      const { searchParams } = new URL(req.url);

      const search = searchParams.get("search");
      const category = searchParams.get("category");
      const subcategory = searchParams.get("subcategory");
      const moduleId = searchParams.get("moduleId"); 
      const sort = searchParams.get("sort");
  
const page = parseInt(searchParams.get("page") || "1", 10);
const limit = parseInt(searchParams.get("limit") || "10", 10);
const skip = (page - 1) * limit;

      if (moduleId && !mongoose.Types.ObjectId.isValid(moduleId)) {
  return NextResponse.json(
    { success: false, message: "Invalid moduleId" },
    { status: 400 }
  );
}

  
      /* ---------------- MATCH FILTER ---------------- */
      const matchStage: any = { isDeleted: false,  recommendedServices: true, };
  
      if (search) {
        matchStage.serviceName = {
          $regex: `\\b${search}[a-zA-Z]*`,
          $options: "i",
        };
      }
  
      if (category) {
        matchStage.category = new mongoose.Types.ObjectId(category);
      }
  
      if (subcategory) {
        matchStage.subcategory = new mongoose.Types.ObjectId(subcategory);
      }
  
      /* ---------------- SORT ---------------- */
      let sortOption: Record<string, 1 | -1> = {};
  
      switch (sort) {
        case "latest": sortOption = { createdAt: -1 }; break;
        case "oldest": sortOption = { createdAt: 1 }; break;
        case "ascending": sortOption = { serviceName: 1 }; break;
        case "descending": sortOption = { serviceName: -1 }; break;
        case "asc": sortOption = { price: 1 }; break;
        case "desc": sortOption = { price: -1 }; break;
        default: sortOption = { createdAt: -1 };
      }
  
      /* ---------------- AGGREGATION PIPELINE ---------------- */
      const pipeline: any[] = [
        { $match: matchStage },
  
        /* 🔗 Category */
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
  
        /* 🔗 Subcategory */
        {
          $lookup: {
            from: "subcategories",
            localField: "subcategory",
            foreignField: "_id",
            as: "subcategory",
          },
        },
        { $unwind: { path: "$subcategory", preserveNullAndEmptyArrays: true } },
  
        /* 🔗 Module */
        {
          $lookup: {
            from: "modules",
            localField: "category.module",
            foreignField: "_id",
            as: "module",
          },
        },
        { $unwind: "$module" },
      ];
  
      /* ✅ MODULE FILTER */
      if (moduleId) {
        pipeline.push({
          $match: {
            "module._id": new mongoose.Types.ObjectId(moduleId),
          },
        });
      }
  
      /* ---------------- COUNT ---------------- */
      const totalPipeline = [...pipeline, { $count: "total" }];
      const totalResult = await Service.aggregate(totalPipeline);
      const total = totalResult[0]?.total || 0;
  
      /* ---------------- DATA ---------------- */
      pipeline.push(
        { $sort: { sortOrder: 1, ...sortOption } },{ $skip: skip },
{ $limit: limit },
...(limit ? [{ $skip: skip }, { $limit: limit }] : [])
      );

      pipeline.push(
  {
    $project: {
      serviceName: 1,
      thumbnailImage: 1,
      averageRating: 1,
      totalReviews: 1,
      keyValues: 1,
      recommendedServices: 1,
      /* CATEGORY */
      category: {
        _id: 1,
        name: 1,
        image: 1,
      },
serviceDetails:{
      packages: "$serviceDetails.packages",
},
      /* FRANCHISE DETAILS */
      franchiseDetails: {
        commission: 1,
        investmentRange: 1,
        monthlyEarnPotential: 1,
        franchiseModel:"$franchiseDetails.franchiseModel",
      },


    },
  }
);

  
      const services = await Service.aggregate(pipeline);
  
      /* ---------------- CLEAN RESPONSE ---------------- */
      const cleanedServices = services
        .map(service => removeEmpty(service))
        .filter(Boolean);
  
      return NextResponse.json(
        {
          success: true,
          page: limit ? page : 1,
          limit: limit ?? total,
          total,
          totalPages: limit ? Math.ceil(total / limit) : 1,
          data: cleanedServices,
        },
        { status: 200, headers: corsHeaders }
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: error.message || "Unknown error" },
        { status: 500, headers: corsHeaders }
      );
    }
  }
  
  