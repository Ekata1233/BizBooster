import { NextResponse } from "next/server";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import "@/models/Category";
import "@/models/Subcategory";
import "@/models/WhyChoose";
import mongoose from "mongoose";

type ProviderPriceInput = {
  provider: string;          // ObjectId as string
  providerMRP?: string;
  providerDiscount?: string;
  providerPrice: number;
  providerCommission?: number;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse JSON body
    const body = await req.json();
    const incoming: ProviderPriceInput[] = body.providerPrices;

    console.log("provider prices data : ", body);

    // Validate providerPrices field existence and type
    if (!Array.isArray(incoming)) {
      return NextResponse.json(
        { success: false, message: "providerPrices must be an array." },
        { status: 400, headers: corsHeaders }
      );
    }

    const service = await Service.findById(id);
    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    /* ------------------------------------------------------------------ */
    /* 2. Merge or add each incoming row -------------------------------- */
    /* ------------------------------------------------------------------ */
    incoming.forEach((p) => {
      const existing = service.providerPrices.find(
        (row: any) => row.provider.toString() === p.provider
      );

      if (existing) {
        // Update existing row
        if (p.providerMRP !== undefined) existing.providerMRP = p.providerMRP;
        if (p.providerDiscount !== undefined) existing.providerDiscount = p.providerDiscount;
        existing.providerPrice = p.providerPrice;
        if (p.providerCommission !== undefined)
          existing.providerCommission = p.providerCommission;
        existing.status = "pending";
      } else {
        // Add new provider row
        service.providerPrices.push({
          provider: new mongoose.Types.ObjectId(p.provider),
          providerMRP: p.providerMRP ?? "",
          providerDiscount: p.providerDiscount ?? "",
          providerPrice: p.providerPrice,
          providerCommission: p.providerCommission ?? 0,
          status: "pending",
        });
      }
    });

    /* ------------------------------------------------------------------ */
    /* 3. Save with validation ------------------------------------------ */
    /* ------------------------------------------------------------------ */
    const updated = await service.save();

    return NextResponse.json(
      { success: true, data: updated },
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
