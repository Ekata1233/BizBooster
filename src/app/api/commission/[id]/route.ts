import Commission from "@/models/Commission";
import { connectToDatabase } from "@/utils/db";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function PUT(req: Request, { params }: any) {
  try {
    await connectToDatabase();
    const { id } = params;
    const { adminCommission, platformFee } = await req.json();
    const updated = await Commission.findByIdAndUpdate(
      id,
      { adminCommission, platformFee },
      { new: true }
    );
    return NextResponse.json(updated, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Error updating commission:", error);
    return NextResponse.json(
      { error: "Failed to update commission." },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    await connectToDatabase();
    const { id } = params;
    await Commission.findByIdAndDelete(id);
    return NextResponse.json({ success: true }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Error deleting commission:", error);
    return NextResponse.json(
      { error: "Failed to delete commission." },
      { status: 500, headers: corsHeaders }
    );
  }
}
