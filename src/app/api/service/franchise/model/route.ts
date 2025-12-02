import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Franchise from "@/models/ExtraService";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

// ✅ POST: Add or update model by size
export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const body = await req.json();
    const { serviceId, model } = body;

    if (!serviceId || !model?.franchiseSize) {
      return NextResponse.json(
        { success: false, message: "serviceId and franchiseSize required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const size = model.franchiseSize;

    // Find franchise
    let franchise = await Franchise.findOne({ serviceId });

    if (!franchise) {
      // First model entry for new service → create document
      franchise = await Franchise.create({
        serviceId,
        investment: [],
        model: [model]
      });

      return NextResponse.json(
        { success: true, message: "Model (first entry) saved", data: franchise },
        { status: 201, headers: corsHeaders }
      );
    }

    // Check if size already exists
    const existingIndex = franchise.model.findIndex(
      (m: any) => m.franchiseSize === size
    );

    if (existingIndex >= 0) {
      franchise.model[existingIndex] = model; // update
    } else {
      franchise.model.push(model); // add new size
    }

    await franchise.save();

    return NextResponse.json(
      { success: true, message: "Model saved/updated", data: franchise },
      { status: 200, headers: corsHeaders }
    );

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET models
export async function GET(req: NextRequest) {
  await connectToDatabase();
  const serviceId = req.nextUrl.searchParams.get("serviceId");

  try {
    const data = await Franchise.findOne({ serviceId });
    return NextResponse.json({ success: true, data }, { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500, headers: corsHeaders });
  }
}
