import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// ✅ Define CORS headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Allow all origins (adjust as needed)
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle OPTIONS request (CORS preflight)
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ Handle POST request to create SMEpay order
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, mobile, amount } = body;

        if (!name || !mobile || !amount) {
            return NextResponse.json(
                { error: "Missing required fields: name, mobile, amount" },
                { status: 400, headers: corsHeaders }
            );
        }

        const payload = {
            name,
            mobile,
            amount, // e.g. 500
            redirect: "https://biz-booster.vercel.app/payment-success",
            webhook: "https://biz-booster.vercel.app/api/payments/smepay-webhook"

        };

        // ✅ Make request to SMEpay
        const smepayRes = await axios.post("https://typof.co/smepay/api/checkout", payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        const responseData = smepayRes.data;

        // ✅ Return checkout URL to Flutter app
        return NextResponse.json(responseData, { headers: corsHeaders });
    } catch (err: any) {
        console.error("SMEpay Error:", err.response?.data || err.message);
        return NextResponse.json(
            { error: "Failed to create SMEpay order" },
            { status: 500, headers: corsHeaders }
        );
    }
}
