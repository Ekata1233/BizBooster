import { NextResponse } from "next/server";
import Category from "@/models/Category";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const contentType = req.headers.get("content-type") || "";

    // ✅ Only handle JSON reorder request
    if (contentType.includes("application/json")) {
      const { categories } = await req.json();

      if (!Array.isArray(categories)) {
        return NextResponse.json(
          { success: false, message: "Invalid categories payload" },
          { status: 400, headers: corsHeaders }
        );
      }

      console.log("✅ Received reorder payload:", categories);

      // ✅ Bulk update sort order (best performance)
      const bulkOps = categories.map((item: any) => ({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { sortOrder: item.sortOrder } }
        }
      }));

      await Category.bulkWrite(bulkOps);

      return NextResponse.json(
        { success: true, message: "Category order updated" },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unsupported content type" },
      { status: 400, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error("❌ Reorder Error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ For CORS preflight
export function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
