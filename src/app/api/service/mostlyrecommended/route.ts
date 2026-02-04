import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import MostHomeServices from "@/models/MostHomeServices";

// ✅ register schemas (VERY IMPORTANT)
import "@/models/Service";
import "@/models/Category";
import "@/models/Subcategory";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    await connectToDatabase();

    const records = await MostHomeServices.find({
      mostlyRecommended: true,
      isDeleted: false,
    })
       .populate({
  path: "service",
  populate: [
    {
      path: "category",
      populate: {
        path: "module",
        select: "name", // only module name
      },
    },
    { path: "subcategory" },
  ],
})
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

                  console.log("data", records);


    const data = records.map((item) => {
      const franchise = item.service?.franchiseDetails || {};
        
      return {
        _id: item._id,

        // ✅ SERVICE DETAILS FIRST
        service: {
          _id: item.service._id,
          serviceName: item.service.serviceName,
            moduleName: item.service.category?.module?.name || null,
          category: item.service.category,
          subcategory: item.service.subcategory,
          packages:item.service.serviceDetails.packages,
          keyValues: item.service.keyValues,
          averageRating: item.service.averageRating,
          totalReviews: item.service.totalReviews,
           thumbnailImage:item.service.thumbnailImage,
        },

        mostlyTrending: item.mostlyTrending,
        mostlyRecommended: item.mostlyRecommended,
        mostlyPopular: item.mostlyPopular,
        sortOrder: item.sortOrder,
        isDeleted: item.isDeleted,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,

        // ✅ FRANCHISE DETAILS LAST
        franchiseDetails: {
          commission: franchise.commission || null,
          areaRequired:franchise.areaRequired || null,
          investmentRange: franchise.investmentRange?.at(-1) || null,
          monthlyEarnPotential: franchise.monthlyEarnPotential?.at(-1) || null,
          franchiseModel: franchise.franchiseModel?.at(-1) || null,
        },
      };
    });



    return NextResponse.json(
      { success: true, data },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("GET mostly recommended error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
