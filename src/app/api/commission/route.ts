import Commission from "@/models/Commission";
import { connectToDatabase } from "@/utils/db";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { adminCommission, platformFee } = await req.json();
    const created = await Commission.create({ adminCommission, platformFee });
    return NextResponse.json(created, {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error creating commission:", error);
    return NextResponse.json(
      { error: "Failed to create commission." },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const data = await Commission.find();
    return NextResponse.json(data, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching commissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch commissions." },
      { status: 500, headers: corsHeaders }
    );
  }
}
