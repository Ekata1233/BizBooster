import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Payment from "@/models/Payment";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    await connectToDatabase();

    try {
        const body = await req.json();

        // Extract only the fields you want from body
        const { amount, payment_id, description, updaterName, customerId,status } = body;

        // Generate an order_id (must be unique)
        const orderId = `ORD-${Date.now()}`;

        const newPayment = new Payment({
            order_id: payment_id,
            amount: amount || 0,   // if not provided, default to 0
            payment_id: payment_id || null,
            description: description || null,
            updaterName: updaterName || null,
            customerId: customerId || null,
            status: status || null,
            // other fields will remain null or default (status = "PENDING", currency = "INR")
        });

        await newPayment.save();

        return NextResponse.json(
            { success: true, message: "Payment saved successfully", data: newPayment },
            { status: 201, headers: corsHeaders }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { success: false, message },
            { status: 400, headers: corsHeaders }
        );
    }
}
