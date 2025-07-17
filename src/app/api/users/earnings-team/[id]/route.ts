import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import User from "@/models/User";
import Wallet from "@/models/Wallet";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
    await connectToDatabase();

    try {
        const url = new URL(req.url);
        const id = url.pathname.split("/").pop();

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Missing user ID." },
                { status: 400, headers: corsHeaders }
            );
        }

        // Count of users referred by this user
        const referralCount = await User.countDocuments({ referredBy: id });

        // Get wallet info
        const wallet = await Wallet.findOne({ userId: id }).select("totalCredits");
        return NextResponse.json(
            {
                teamBuild: referralCount,
                totalEarning: wallet?.totalCredits || 0,
            },
            { headers: corsHeaders }
        );

    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json(
            { success: false, message },
            { status: 500, headers: corsHeaders }
        );
    }
}
