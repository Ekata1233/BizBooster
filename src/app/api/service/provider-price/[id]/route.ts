import { NextResponse } from "next/server";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import "@/models/Category";
import "@/models/Subcategory";
import mongoose from "mongoose";

type ProviderPriceInput = {
  provider: string; // ObjectId as string
  providerMRP?: number;
  providerDiscount?: number;
  providerPrice: number;
  providerCommission?: number;
  status?: "approved" | "pending";
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

    const body = await req.json();
    const incoming: ProviderPriceInput[] = body.providerPrices;

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

    // Loop through each incoming provider price update
    incoming.forEach((p) => {
      const existing = service.providerPrices.find(
        (row: any) => row.provider.toString() === p.provider
      );

      if (existing) {
        // Detect if price/MRP/discount changed
        const hasPriceChanged =
          (p.providerMRP !== undefined && existing.providerMRP !== p.providerMRP) ||
          (p.providerDiscount !== undefined &&
            existing.providerDiscount !== p.providerDiscount) ||
          (p.providerPrice !== undefined && existing.providerPrice !== p.providerPrice);

        // Update values
        if (p.providerMRP !== undefined) existing.providerMRP = p.providerMRP;
        if (p.providerDiscount !== undefined) existing.providerDiscount = p.providerDiscount;
        if (p.providerPrice !== undefined) existing.providerPrice = p.providerPrice;
        if (p.providerCommission !== undefined) {
          existing.providerCommission = p.providerCommission;
        }

        // If price changed and it's NOT a direct subscribe, mark as pending
        if (hasPriceChanged && p.status !== "approved") {
          existing.status = "pending";
        } else if (p.status) {
          // Use provided status if no changes
          existing.status = p.status;
        }
      } else {
        // Add new provider entry for this service
        service.providerPrices.push({
          provider: new mongoose.Types.ObjectId(p.provider),
          providerMRP: p.providerMRP ?? 0,
          providerDiscount: p.providerDiscount ?? 0,
          providerPrice: p.providerPrice,
          providerCommission: p.providerCommission ?? 0,
          status: p.status ?? "pending",
        });
      }
    });

    const updated = await Service.findByIdAndUpdate(
      id,
      { $set: { providerPrices: service.providerPrices } },
      { new: true }
    );

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
