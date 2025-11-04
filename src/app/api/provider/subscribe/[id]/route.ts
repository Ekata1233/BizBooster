import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Provider from "@/models/Provider";
import Service from "@/models/Service";
import "@/models/Category";
import "@/models/Subcategory";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET: Fetch subscribed services for a provider
 * Example: /api/provider/subscribed-services?providerId=123
 */
export async function GET(req: NextRequest) {
    await connectToDatabase();

    try {
    const url = new URL(req.url);
    const providerId = url.pathname.split("/").pop();

        console.log("provider id : ", providerId)

        if (!providerId || !mongoose.Types.ObjectId.isValid(providerId)) {
            return NextResponse.json(
                { success: false, message: "Invalid or missing providerId" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Fetch provider and their subscribed services
        const provider = await Provider.findById(providerId)
            .populate("subscribedServices")
            .lean();

        if (!provider) {
            return NextResponse.json(
                { success: false, message: "Provider not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        // Fetch full service details for the subscribed services
        const services = await Service.find({
            _id: { $in: provider.subscribedServices },
        })
            .populate("category")
            // .populate("subCategory")
            .lean();

        // Map services with provider-specific pricing
        const mappedServices = services.map((svc: any, index: number) => {
            const providerPriceEntry = svc.providerPrices?.find(
                (pp: any) => String(pp.provider?._id) === String(providerId)
            );

            const providerPrice = providerPriceEntry?.providerPrice ?? null;
            const providerMRP = providerPriceEntry?.providerMRP ?? null;
            const providerDiscount = providerPriceEntry?.providerDiscount ?? null;
            const providerCommission = providerPriceEntry?.providerCommission ?? null;

            return {
                srNo: index + 1,
                id: svc._id,
                serviceName: svc.serviceName || "—",
                categoryName: svc.category?.name || "—",
                subCategoryName: svc.subCategory?.name || "—",
                discountedPrice: svc.discountedPrice ?? null,
                providerPrice,
                providerMRP,
                providerDiscount,
                providerCommission,
                status: "Subscribed",
            };
        });

        return NextResponse.json(
            { success: true, data: mappedServices },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json(
            { success: false, message: err.message },
            { status: 500, headers: corsHeaders }
        );
    }
}
