import { NextResponse } from "next/server";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import "@/models/Category"
import "@/models/Subcategory"
import "@/models/WhyChoose"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}


export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse JSON body (make sure client sends JSON)
    const body = await req.json();

    console.log("provider price data : ",body)

    // Validate providerPrices field existence and type
    if (!body.providerPrices || !Array.isArray(body.providerPrices)) {
      return NextResponse.json(
        { success: false, message: "providerPrices must be an array." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Optionally, validate each providerPrice object structure here
    const pricesWithPending = body.providerPrices.map((p: any) => ({
      ...p,
      status: 'pending',          // <-- always overwrite to pending
    }));
    // Update only the providerPrices field
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { $set: { providerPrices: pricesWithPending } },
      { new: true, runValidators: true },
    );

    if (!updatedService) {
      return NextResponse.json(
        { success: false, message: "Service not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedService },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 400, headers: corsHeaders }
    );
  }
}

