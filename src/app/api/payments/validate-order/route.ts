import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const order_id = url.searchParams.get("order_id");
        const amount = url.searchParams.get("amount");
        const token = url.searchParams.get("token");

        if (!order_id || !amount) {
            return NextResponse.json({ error: "order_id and amount required" }, { status: 400 });
        }

        console.log("slug : ", order_id)
        // Call SME Pay validate-order API
        const response = await axios.post(
            "https://apps.typof.com/api/external/validate-order",
            {
                client_id: process.env.SMEPAY_CLIENT_ID,
                amount: amount,
                slug: order_id,
            },
            {
                headers: { 
                     Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // The response contains payment status
        return NextResponse.json(response.data, { headers: corsHeaders });
    } catch (error: any) {
        console.error("Validate Order Error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: error.response?.data || "Validation request failed" },
            { status: 500, headers: corsHeaders }
        );
    }
}
