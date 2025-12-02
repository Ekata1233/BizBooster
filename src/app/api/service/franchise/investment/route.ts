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

// ✅ POST: Add/Update investment by size
export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const body = await req.json();
    const { serviceId, investment } = body;

    if (!serviceId || !investment?.franchiseSize) {
      return NextResponse.json(
        { success: false, message: "serviceId and franchiseSize required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const size = investment.franchiseSize; // Small | Medium | Large

    // 🟦 Step 1: Find Franchise document or create it
    let franchise = await Franchise.findOne({ serviceId });

    if (!franchise) {
      // First time → create
      franchise = await Franchise.create({
        serviceId,
        investment: [investment],
        model: []
      });

      return NextResponse.json(
        { success: true, message: "Investment (first entry) saved", data: franchise },
        { status: 201, headers: corsHeaders }
      );
    }

    // 🟦 Step 2: check if this size exists → update OR add
    const existingIndex = franchise.investment.findIndex(
      (i: any) => i.franchiseSize === size
    );

    if (existingIndex >= 0) {
      franchise.investment[existingIndex] = investment; // update
    } else {
      franchise.investment.push(investment); // add new size
    }

    await franchise.save();

    return NextResponse.json(
      { success: true, message: "Investment saved/updated", data: franchise },
      { status: 200, headers: corsHeaders }
    );

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET all investments
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
