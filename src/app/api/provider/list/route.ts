// src/app/api/provider/route.ts
import Provider, { ProviderDocument } from "@/models/Provider";
import "@/models/Service"; // your service model
import "@/models/Module";
import "@/models/Category";
import "@/models/Subcategory";  // your module model
import Review from "@/models/Review";   // your review model
import { connectToDatabase } from "@/utils/db";
import { NextResponse } from "next/server";
import { HydratedDocument } from "mongoose";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
    await connectToDatabase();

    try {
        const providers = await Provider.find()
            .select("fullName storeInfo subscribedServices")
            .populate({
                path: "storeInfo.module",
                select: "name",
            })
            .populate({
                path: "subscribedServices",
                select: "serviceName category subcategory price discount discountedPrice",
                populate: [
                    { path: "category", select: "name" },
                    { path: "subcategory", select: "name" },
                ],
            });

        const enhancedProviders = await Promise.all(
            providers.map(async (provider: HydratedDocument<ProviderDocument>) => {
                const reviews = await Review.find({ provider: provider._id });
                const totalReviews = reviews.length;
                const averageRating =
                    totalReviews > 0
                        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
                        : 0;

                return {
                    _id: provider._id,
                    fullName: provider.fullName,
                    storeInfo: provider.storeInfo,
                    module: provider.storeInfo?.module || null,
                    averageRating: Number(averageRating.toFixed(1)),
                    totalReviews,
                    subscribedServices: (provider.subscribedServices || []).map((service: any) => ({
                        _id: service._id,
                        serviceName: service.serviceName,
                        category: service.category,
                        subcategory: service.subcategory,
                        price: service.price,
                        discount: service.discount,
                        discountedPrice: service.discountedPrice,
                    })),
                };
            })
        );

        return NextResponse.json(enhancedProviders, { headers: corsHeaders });
    } catch (error) {
        console.error("Error fetching providers:", error);
        return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
    }
}
