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
        const body = await req.json();
        const { name, email, mobile, amount,userId } = body;

        if (!name || !email || !mobile || !amount || !userId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400, headers: corsHeaders }
            );
        }

        console.log("SMEPAY_CLIENT_SECRET", process.env.SMEPAY_CLIENT_SECRET);


        // ✅ Step 1: Authenticate to get access_token
        const authRes = await axios.post("https://apps.typof.in/api/external/auth", {
            client_id: process.env.SMEPAY_CLIENT_ID,
            client_secret: process.env.SMEPAY_CLIENT_SECRET,
        });

        const accessToken = authRes.data.access_token;

        // ✅ Step 2: Create Order using access_token
        const orderPayload = {
            client_id: process.env.SMEPAY_CLIENT_ID,
            amount: (parseFloat(amount) / 100).toFixed(2),
            order_id: `ORDER-${Date.now()}`,
            callback_url: "https://biz-booster.vercel.app/payment-success",
            customer_details: {
                email,
                mobile,
                name,
                userId
            },
        };

        const orderRes = await axios.post(
            "https://apps.typof.in/api/external/create-order",
            orderPayload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const { order_slug, message } = orderRes.data;

        const qrRes = await axios.post(
            "https://apps.typof.com/api/external/generate-qr",
            {
                slug: order_slug,
                client_id: process.env.SMEPAY_CLIENT_ID,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );


        const { qrcode, link, ref_id, data } = qrRes.data;

        return NextResponse.json(
            {
                status: true,
                message,
                order_slug,
                ref_id,
                amount: data.amount,
                payment_status: data.payment_status,
                qrcode, // base64 QR code image
                upi_links: link, // { gpay, phonepe, paytm, bhim }
            },
            { headers: corsHeaders }
        );
    } catch (err: any) {
        console.error("SMEpay Error:", err.response?.data || err.message);
        return NextResponse.json(
            { error: "Failed to create SMEpay order" },
            { status: 500, headers: corsHeaders }
        );
    }
}
