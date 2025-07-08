import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import User from "@/models/User";
import "@/models/Service";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

/* ───────────────────────────────────────────────
 *  PUT method for the service add in to the favourite
 * ───────────────────────────────────────────── */
export async function PUT(req: Request) {
    await connectToDatabase();

    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const serviceId = parts.pop();
    const userId = parts.pop();

    console.log("url : ", url)

    if (!userId) {
        return NextResponse.json(
            { success: false, message: "Missing userId" },
            { status: 400, headers: corsHeaders }
        );
    }
    if (!serviceId) {
        return NextResponse.json(
            { success: false, message: "Missing serviceId" },
            { status: 400, headers: corsHeaders }
        );
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { favoriteServices: serviceId } },
            { new: true }
        ).populate({
            path: "favoriteServices",
            select: `
    serviceName 
    price 
    discount 
    discountedPrice 
    thumbnailImage 
    bannerImages 
    averageRating 
    totalReviews 
    franchiseDetails.commission
  `,
        });

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { success: true, data: updatedUser.favoriteServices },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "Failed to add favorite" },
            { status: 500, headers: corsHeaders }
        );
    }
}

/* ───────────────────────────────────────────────
 *  DELETE method for the remove the service from the favourite
 * ───────────────────────────────────────────── */
export async function DELETE(req: Request) {
    await connectToDatabase();

    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const serviceId = parts.pop();
    const userId = parts.pop();

    if (!userId) {
        return NextResponse.json(
            { success: false, message: "Missing userId" },
            { status: 400, headers: corsHeaders }
        );
    }
    if (!serviceId) {
        return NextResponse.json(
            { success: false, message: "Missing serviceId" },
            { status: 400, headers: corsHeaders }
        );
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { favoriteServices: serviceId } },
            { new: true }
        ).populate("favoriteServices");

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { success: true, data: updatedUser.favoriteServices },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "Failed to remove favorite" },
            { status: 500, headers: corsHeaders }
        );
    }
}
