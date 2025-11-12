import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Provider from "@/models/Provider";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function PATCH(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // extract provider ID from URL

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing provider ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { aboutUs } = body;


    if (typeof aboutUs !== "string" || aboutUs.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Invalid or missing 'aboutUs' field." },
        { status: 400, headers: corsHeaders }
      );
    }

    const provider = await Provider.findById(id);
    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Provider not found." },
        { status: 404, headers: corsHeaders }
      );
    }


    // ✅ Ensure storeInfo exists
    if (!provider.storeInfo) {
      provider.storeInfo = {};
    }

    // ✅ Update aboutUs
    provider.storeInfo.aboutUs = aboutUs.trim();

    await provider.save();

    return NextResponse.json(
      {
        success: true,
        message: "About Us updated successfully.",
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
