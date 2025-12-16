import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";

import User from "@/models/User";

import "@/models/Service";
import "@/models/ServiceCustomer";
import "@/models/Checkout";
import "@/models/Wallet";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    await connectToDatabase();

    try {
        // ----------------------------
        // QUERY PARAMETERS
        // ----------------------------
        const { search, sort, page, limit, startDate, endDate,status } =
            Object.fromEntries(new URL(req.url).searchParams);
            

        const pageNum = Number(page) || 1;
        const perPage = Number(limit) || 50;
        const skip = (pageNum - 1) * perPage;

        // ----------------------------
        // BUILD MATCH FILTER
        // ----------------------------
        const match: any = {  };

        // Search filter
        if (search) {
            const regex = new RegExp(search, "i");
            match.$or = [
                { fullName: regex },
                { email: regex },
                { mobileNumber: regex },
                { referralCode: regex },
                {isDeleted: regex},
            ];
        }

        // Date filter
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const d = new Date(endDate);
                d.setHours(23, 59, 59, 999);
                match.createdAt.$lte = d;
            }
        }

        if (status) {
            if (status === "Deleted") {
                match.isDeleted = true;
            } else if (status === "NonGP") {
                match.isDeleted = false;
                match.$or = [
                    { packageStatus: null },
                    { packageStatus: "" },
                    { packageStatus: "NonGP" },
                    { packageStatus: { $exists: false } },
                ];
            } else {
                match.isDeleted = false;
                match.packageStatus = status; // GP, SGP, PGP
            }
        }

        // Sort mapping
        const sortOptions: any = {
            latest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            ascending: { fullName: 1 },
            descending: { fullName: -1 },
        };

        const sortBy = sortOptions[sort as keyof typeof sortOptions] || { createdAt: -1 };

        // ----------------------------
        // AGGREGATION PIPELINE
        // ----------------------------
        const pipeline: any[] = [
            { $match: match },

            // populate referredBy
            {
                $lookup: {
                    from: "users",
                    localField: "referredBy",
                    foreignField: "_id",
                    as: "referrer",
                },
            },

            // count checkouts
            {
                $lookup: {
                    from: "checkouts",
                    let: { userId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user", "$$userId"] },
                                        { $eq: ["$isDeleted", false] },
                                    ],
                                },
                            },
                        },
                        { $count: "count" },
                    ],
                    as: "bookingsCount",
                },
            },

            // lookup wallet balance
            {
                $lookup: {
                    from: "wallets",
                    let: { userId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
                        { $project: { balance: 1 } },
                    ],
                    as: "wallet",
                },
            },

            // shaping the output
            {
                $project: {
                    fullName: 1,
                    email: 1,
                    mobileNumber: 1,
                    profilePhoto: 1,
                    packageStatus: 1,
                    createdAt: 1,
                    isDeleted: 1,
                    referredBy: { $arrayElemAt: ["$referrer.fullName", 0] },
                    totalBookings: {
                        $ifNull: [{ $arrayElemAt: ["$bookingsCount.count", 0] }, 0],
                    },
                    walletBalance: {
                        $ifNull: [{ $arrayElemAt: ["$wallet.balance", 0] }, 0],
                    },
                },
            },

            { $sort: sortBy },
            { $skip: skip },
            { $limit: perPage },
        ];

        const users = await User.aggregate(pipeline);
        const totalUsers = await User.countDocuments(match);

        const statusAggregation = await User.aggregate([
    { $match: match },
    {
        $project: {
            status: {
                $cond: [
                    "$isDeleted",
                    "Deleted",
                    { $toUpper: { $ifNull: ["$packageStatus", "NonGP"] } }
                ],
            },
        },
    },
    {
        $group: {
            _id: "$status",
            count: { $sum: 1 },
        },
    },
]);


        const statusCounts: Record<string, number> = { GP: 0, SGP: 0, PGP: 0, NonGP: 0, Deleted: 0 };
statusAggregation.forEach((s: any) => {
    const key = s._id === "NONGP" ? "NonGP" : s._id;
    statusCounts[key] = s.count;
});
//{ serviceName: "Risk Assessments" } 683ea5a86d41ff233234cd57

        return NextResponse.json(
            {
                success: true,
                total: totalUsers,
                 statusCounts,
                page: pageNum,
                limit: perPage,
                data: users,
            },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("Error in /api/users/with-details:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Server error",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500, headers: corsHeaders }
        );
    }
}
