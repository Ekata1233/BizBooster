import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Checkout from "@/models/Checkout"; // make sure path is correct

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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

        console.log("id : ", id);

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Missing ID parameter." },
                { status: 400, headers: corsHeaders }
            );
        }

        const checkouts = await Checkout.find({ user: id }).populate({
            path: 'service',
            select: 'serviceName', // ✅ only populate serviceName
        })
            .populate('serviceCustomer');

        if (!checkouts) {
            return NextResponse.json(
                { success: false, message: "Checkout not found." },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { success: true, data: checkouts },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("Error fetching checkout by ID:", error);
        return NextResponse.json(
            { success: false, message: "Server error." },
            { status: 500, headers: corsHeaders }
        );
    }
}
