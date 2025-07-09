import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Lead from "@/models/Lead";
import "@/models/Checkout"; // ✅ Import referenced models
import "@/models/ServiceMan"; // Assuming used for serviceCustomer and serviceMan
import "@/models/Service";
import "@/models/ServiceCustomer"; // ✅ Import referenced models

import imagekit from "@/utils/imagekit";
import mongoose from "mongoose";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// export async function getProvidersByServiceModule(serviceId: string) {
//   // Step 1: Fetch the service, populate subcategory → category → module
//   const service = await Service.findById(serviceId)
//     .populate({
//       path: 'subcategory',
//       populate: {
//         path: 'category',
//         select: 'module', // we only need the module
//       },
//     });

//   if (
//     !service ||
//     !service.subcategory ||
//     !service.subcategory.category ||
//     !service.subcategory.category.module
//   ) {
//     throw new Error('Module not found from service');
//   }

//   const moduleId = service.subcategory.category.module;

//   // Step 2: Find providers with that module
//   const providers = await Provider.find({ module: moduleId });

//   return providers;
// }

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();

    const checkout = formData.get("checkout") as string;
    // const serviceCustomer = formData.get("serviceCustomer") as string;
    // const serviceManRaw = formData.get("serviceMan") as string;
    // const service = formData.get("service") as string;
    const amountRaw = formData.get("amount") as string | null;
    const amount = amountRaw && amountRaw.trim() !== "" ? parseFloat(amountRaw) : undefined;

    // const serviceMan =
    //   serviceManRaw && serviceManRaw.trim() !== "" && mongoose.Types.ObjectId.isValid(serviceManRaw)
    //     ? serviceManRaw
    //     : null;
    const serviceManRaw = formData.get("serviceMan") as string;
    const serviceMan =
      serviceManRaw &&
        serviceManRaw.trim() !== "" &&
        serviceManRaw !== "null" &&  // Add this check
        mongoose.Types.ObjectId.isValid(serviceManRaw)
        ? serviceManRaw
        : undefined;

    // if (!serviceMan) {
    //   return NextResponse.json(
    //     { error: "Invalid or missing serviceman", message: "Please assign serviceman" },
    //     { status: 400 }
    //   );
    // }
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
        // serviceCustomer,
        serviceMan: serviceMan || undefined,
        // service,
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
