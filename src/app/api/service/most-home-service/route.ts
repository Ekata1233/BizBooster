import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import MostHomeServices from "@/models/MostHomeServices";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const { service, mostlyTrending, mostlyRecommended, mostlyPopular } = body;

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if this service config already exists
    let existing = await MostHomeServices.findOne({
      service,
      isDeleted: false,
    });

    let message = "";

    if (existing) {
      // Update only provided flags
      const updateData: Record<string, boolean> = {};

      if (mostlyTrending !== undefined) updateData.mostlyTrending = mostlyTrending;
      if (mostlyRecommended !== undefined) updateData.mostlyRecommended = mostlyRecommended;
      if (mostlyPopular !== undefined) updateData.mostlyPopular = mostlyPopular;

      existing = await MostHomeServices.findByIdAndUpdate(
        existing._id,
        { $set: updateData },
        { new: true }
      );

      // Dynamic message based on updated flag
      if (mostlyTrending !== undefined)
        message = mostlyTrending
          ? "Service mostly trending successfully"
          : "Service removed from mostly trending";

      if (mostlyRecommended !== undefined)
        message = mostlyRecommended
          ? "Service mostly recommended successfully"
          : "Service removed from mostly recommended";

      if (mostlyPopular !== undefined)
        message = mostlyPopular
          ? "Service mostly popular successfully"
          : "Service removed from mostly popular";
    } else {
      // Create new config
      const newConfig = await MostHomeServices.create({
        service,
        mostlyTrending: mostlyTrending || false,
        mostlyRecommended: mostlyRecommended || false,
        mostlyPopular: mostlyPopular || false,
      });

      existing = newConfig;

      // Dynamic message
      if (mostlyTrending) message = "Service mostly trending successfully";
      else if (mostlyRecommended) message = "Service mostly recommended successfully";
      else if (mostlyPopular) message = "Service mostly popular successfully";
      else message = "Service added successfully";
    }

    return NextResponse.json(
      { success: true, message, data: existing },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("POST update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
