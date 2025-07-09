import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import User from "@/models/User";
import "@/models/Provider";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

/* ───────────────────────────────────────────────
 *  PUT method for the provider add in to the favourite
 * ───────────────────────────────────────────── */
export async function PUT(req: Request) {
    await connectToDatabase();

    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const providerId = parts.pop();
    const userId = parts.pop();

    console.log("url : ", url)

    if (!userId) {
        return NextResponse.json(
            { success: false, message: "Missing userId" },
            { status: 400, headers: corsHeaders }
        );
    }
    if (!providerId) {
        return NextResponse.json(
            { success: false, message: "Missing providerId" },
            { status: 400, headers: corsHeaders }
        );
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { favoriteProviders: providerId } },
            { new: true }
        ).populate("favoriteProviders");

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { success: true, message: "Provider successfully added to favourites." },
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
 *  DELETE method for the remove the provider from the favourite
 * ───────────────────────────────────────────── */
export async function DELETE(req: Request) {
    await connectToDatabase();

    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const providerId = parts.pop();
    const userId = parts.pop();

    if (!userId) {
        return NextResponse.json(
            { success: false, message: "Missing userId" },
            { status: 400, headers: corsHeaders }
        );
    }
    if (!providerId) {
        return NextResponse.json(
            { success: false, message: "Missing providerId" },
            { status: 400, headers: corsHeaders }
        );
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { favoriteProviders: providerId } },
            { new: true }
        ).populate("favoriteProviders");

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { success: true, message: "Provider successfully removed from favourites." },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "Failed to remove favorite" },
            { status: 500, headers: corsHeaders }
        );
    }
}
