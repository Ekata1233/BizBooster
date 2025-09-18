import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import "@/models/Category";
import "@/models/Service";
import UpcomingCommission from "@/models/UpcomingCommission";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // last segment as ID

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing checkoutId parameter." },
        { status: 200, headers: corsHeaders }
      );
    }

    const record = await UpcomingCommission.findOne({ checkoutId: id }).lean();

    if (!record) {
      return NextResponse.json(
        { success: false, message: "No record found for this checkoutId." },
        { status: 200, headers: corsHeaders }
      );
    }

    // Format numeric values to 2 decimal places
    const formattedRecord = Object.fromEntries(
      Object.entries(record).map(([key, value]) =>
        typeof value === "number"
          ? [key, Number(value.toFixed(2))]
          : [key, value]
      )
    );

    return NextResponse.json(
      { success: true, data: formattedRecord },
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
