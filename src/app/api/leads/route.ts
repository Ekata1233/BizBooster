import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Lead from "@/models/Lead";
import "@/models/Checkout"; // ✅ Import referenced models
import "@/models/ServiceMan"; // Assuming used for serviceCustomer and serviceMan
import  "@/models/Service";
import "@/models/ServiceCustomer"; // ✅ Import referenced models

import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}



export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();

    const checkout = formData.get("checkout") as string;
    const serviceCustomer = formData.get("serviceCustomer") as string;
    const serviceMan = formData.get("serviceMan") as string;
    const service = formData.get("service") as string;
    const amount = parseFloat(formData.get("amount") as string);

    const leadsData = JSON.parse(formData.get("leads") as string); // should be an array with one status object

    const uploadedDocument = formData.get("document") as File | null;
    let documentUrl = "";

    if (uploadedDocument) {
      const bytes = await uploadedDocument.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploaded = await imagekit.upload({
        file: buffer,
        fileName: uploadedDocument.name,
        folder: "lead-documents",
      });

      documentUrl = uploaded.url;
    }

    // Attach document URL if available
    if (documentUrl && leadsData.length > 0) {
      leadsData[0].document = documentUrl;
    }

    // Step 1: Check if a lead already exists with this checkout
    const existingLead = await Lead.findOne({ checkout });

    if (existingLead) {
      // Step 2: Append new status to existing lead
      existingLead.leads.push(leadsData[0]); // Add only one status at a time
      await existingLead.save();
      return NextResponse.json(existingLead, { status: 200, headers: corsHeaders });
    } else {
      // Step 3: Create new lead
      const newLead = await Lead.create({
        checkout,
        serviceCustomer,
        serviceMan,
        service,
        amount,
        leads: leadsData,
      });
      return NextResponse.json(newLead, { status: 201, headers: corsHeaders });
    }
} catch (error: any) {
  console.error("Error in POST /api/lead:", error);

  return NextResponse.json(
    {
      error: "Failed to process lead",
      message: error?.message || "Unknown error",
      stack: process.env.NODE_ENV !== "production" ? error?.stack : undefined,
    },
    { status: 500, headers: corsHeaders }
  );
}

}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const leads = await Lead.find({})
      // .populate("checkout")
      // .populate("serviceCustomer")
      // .populate("serviceMan")
      // .populate("service")
      .sort({ createdAt: -1 });

    return NextResponse.json(leads, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500, headers: corsHeaders });
  }
}