import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import MostHomeServices from "@/models/MostHomeServices";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const {
      id,
      mostlyTrending,
      mostlyRecommended,
      mostlyPopular,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const updateData: Record<string, boolean> = {};

    if (typeof mostlyTrending === "boolean")
      updateData.mostlyTrending = mostlyTrending;

    if (typeof mostlyRecommended === "boolean")
      updateData.mostlyRecommended = mostlyRecommended;

    if (typeof mostlyPopular === "boolean")
      updateData.mostlyPopular = mostlyPopular;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update" },
        { status: 400, headers: corsHeaders }
      );
    }

    const updated = await MostHomeServices.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updated },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("PUT MostHomeServices error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
