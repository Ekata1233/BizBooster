// src/app/api/commission-preview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import UpcomingPackgeCommission from "@/models/UpcomingPackgeCommission";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Pagination params
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const skip = (page - 1) * limit;

        // Fetch data with pagination
        const data = await UpcomingPackgeCommission.find({})
            .populate({
                path: "commissionFrom",
                select: "fullName email phone userId" 
            })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        // Count total records
        const total = await UpcomingPackgeCommission.countDocuments();

        return NextResponse.json(
            {
                success: true,
                page,
                limit,
                total,
                data,
            },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("GET /api/commission-preview error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
