import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import User from "@/models/User";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

export async function PATCH(req: NextRequest) {
    await connectToDatabase();

    try {
        const url = new URL(req.url);
        const id = url.pathname.split("/").pop();

        if (!id) {
            return NextResponse.json(
                { success: false, message: "User ID not provided in URL" },
                { status: 400, headers: corsHeaders }
            );
        }

        const body = await req.json();
        const { addressType, address } = body;

        const allowedTypes = ["homeAddress", "workAddress", "otherAddress"];
        if (!allowedTypes.includes(addressType)) {
            return NextResponse.json(
                { success: false, message: "Invalid address type" },
                { status: 400, headers: corsHeaders }
            );
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                [addressType]: address,
                addressCompleted: true, // ✅ mark address step as completed
            },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: `${addressType} updated successfully`,
                data: updatedUser[addressType],
            },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { success: false, message },
            { status: 500, headers: corsHeaders }
        );
    }
}
