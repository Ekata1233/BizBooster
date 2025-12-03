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

  if (!serviceId || !Array.isArray(model) || model.length === 0) {
      return NextResponse.json(
        { success: false, message: "serviceId & model array required" },
        { status: 400, headers: corsHeaders }
      );
    }

    let franchise = await Franchise.findOne({ serviceId });

    if (!franchise) {
      // Create first entry
      franchise = await Franchise.create({
        serviceId,
        investment: [],
        model: model // directly save the full model array
      });

      return NextResponse.json(
        { success: true, message: "Models saved", data: franchise },
        { status: 201, headers: corsHeaders }
      );
    }

    // Update or add models by size
    model.forEach((newModel: any) => {
      const index = franchise.model.findIndex(
        (m: any) => m.franchiseSize === newModel.franchiseSize
      );

      if (index >= 0) {
        franchise.model[index] = newModel; // update existing
      } else {
        franchise.model.push(newModel); // add new
      }
    });

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
