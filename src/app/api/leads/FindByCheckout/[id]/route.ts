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


export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const pathnameParts = url.pathname.split("/");
    const checkoutId = pathnameParts[pathnameParts.length - 1];

    if (!checkoutId) {
      return NextResponse.json(
        { success: false, message: "Update the status of lead." },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { newAmount, extraService } = body;

    // Build dynamic update object
    const updateFields: any = {};
    if (newAmount !== undefined) updateFields.newAmount = newAmount;
    if (extraService !== undefined) updateFields.extraService = extraService;

    const updatedLead = await Lead.findOneAndUpdate(
      { checkout: checkoutId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedLead) {
      return NextResponse.json(
        { success: false, message: "Lead not found for this checkoutId." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Lead updated successfully.", data: updatedLead },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Update failed." },
      { status: 500, headers: corsHeaders }
    );
  }
}
