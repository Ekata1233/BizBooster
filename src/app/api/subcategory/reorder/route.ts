import { NextResponse } from "next/server";
import Subcategory from "@/models/Subcategory";
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
      const { subcategories } = await req.json(); // ✅ change categories → subcategories

      if (!Array.isArray(subcategories)) {
        return NextResponse.json(
          { success: false, message: "Invalid subcategories payload" },
          { status: 400, headers: corsHeaders }
        );
      }

      console.log("✅ Received subcategories reorder payload:", subcategories);

      // ✅ Bulk update sortOrder
      const bulkOps = subcategories.map((item: any) => ({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { sortOrder: item.sortOrder } }
        }
      }));

      await Subcategory.bulkWrite(bulkOps);

      return NextResponse.json(
        { success: true, message: "Subcategory order updated" },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unsupported content type" },
      { status: 400, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error("❌ Subcategory Reorder Error:", error);
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
