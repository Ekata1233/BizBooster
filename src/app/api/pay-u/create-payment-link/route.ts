import Payment from "@/models/Payment";
import { connectToDatabase } from "@/utils/db";
import axios from "axios";
import { NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(req) {
    try {
        await connectToDatabase();

        const body = await req.json();

        // 1️⃣ Get OAuth Access Token
        const tokenRes = await axios.post(
            "https://accounts.payu.in/oauth/token",
            new URLSearchParams({
                grant_type: "client_credentials",
                client_id: process.env.PAYU_CLIENT_ID,
                client_secret: process.env.PAYU_CLIENT_SECRET,
                scope: "create_payment_links",
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const accessToken = tokenRes.data.access_token;


        const payload = {
            subAmount: body.subAmount || 0,
            isPartialPaymentAllowed: body.isPartialPaymentAllowed ?? false,
            description: body.description || "Fetch True Payment",
            source: "API",
            order_id: body.orderId,
            // transactionId: body.checkoutId,
            customer: {
                customerId: body?.customer.customer_id?.toString() ?? "",
                name: body?.customer.customer_name?.toString() ?? "",
                email: body?.customer.customer_email?.toString() ?? "",
                phone: body?.customer.customer_phone?.toString() ?? ""
            },
            udf: {
                udf1: body.udf?.udf1 || "orderIdDefault",
                udf2: body.udf?.udf2 || "customerIdDefault",
                udf3: body.udf?.udf3 || "checkoutIdDefault",
                udf4: body.udf?.udf4 || "",
                udf5: body.udf?.udf5 || ""
            }
        };

        // ✅ Make POST request to PayU API
        const response = await fetch(`https://oneapi.payu.in/payment-links/`, {
            method: "POST",
            headers: {
                "merchantId": process.env.PAYU_MERCHANT_ID!,
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();


        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to create payment link", details: data },
                { status: response.status, headers: corsHeaders }
            );
        }

        const paymentDoc = await Payment.create({
            order_id: body.orderId,
            amount: body.subAmount || 0,
            currency: "INR", // or from body if dynamic
            status: "PENDING",
            name: payload.customer.name,
            email: payload.customer.email,
            phone: payload.customer.phone,
            description: payload.description,
            customerId: payload.customer.customerId,
            slug: data?.guid || "", // PayU payment link ID as slug
            updaterName: "system", // optional: who created it
        });

        console.log("Payment saved in DB:", paymentDoc);

        return new NextResponse(JSON.stringify(data), {
            status: 200,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
            },
        });
    } catch (err) {
        console.error("PayU error:", err.response?.data || err.message);
        return new NextResponse(
            JSON.stringify({
                error: "Failed to create payment link",
                details: err.response?.data || err.message,
            }),
            {
                status: err.response?.status || 500,
                headers: corsHeaders,
            }
        );
    }
}
