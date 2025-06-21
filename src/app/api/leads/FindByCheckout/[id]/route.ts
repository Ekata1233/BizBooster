import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Lead from "@/models/Lead";
import "@/models/Checkout";
import "@/models/ServiceCustomer";
import "@/models/Service";
import "@/models/ServiceMan";

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
    const pathnameParts = url.pathname.split("/");
    const checkoutId = pathnameParts[pathnameParts.length - 1];
    console.log("checkout id : ",checkoutId)

    if (!checkoutId) {
      return NextResponse.json(
        { success: false, message: "Missing checkoutId in query." },
        { status: 400, headers: corsHeaders }
      );
    }

    const lead = await Lead.findOne({ checkout: checkoutId })
    //   .populate("checkout")
    //   .populate("serviceCustomer")
    //   .populate("serviceMan")
    //   .populate("service");

    if (!lead) {
      return NextResponse.json(
        { success: false, message: "No lead found for this checkoutId." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: lead },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error fetching lead by checkoutId:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Fetch failed." },
      { status: 500, headers: corsHeaders }
    );
  }
}
