import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();

        console.log("body : ", body);

        // 1️⃣ Get OAuth Access Token
        const tokenRes = await axios.post(
            "https://uat-accounts.payu.in/oauth/token",
            new URLSearchParams({
                grant_type: "client_credentials",
                client_id: process.env.PAYU_CLIENT_ID,
                client_secret: process.env.PAYU_CLIENT_SECRET,
                scope: "create_payment_links",
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const accessToken = tokenRes.data.access_token;

                console.log("accesstoken : ", accessToken)


        const payload = {
            subAmount: body.subAmount || 0,
            isPartialPaymentAllowed: body.isPartialPaymentAllowed ?? false,
            description: body.description || "Fetch True Payment",
            source: "API",
            order_id: body.orderId,
            transactionId:body.checkoutId,
            customer: {
                customerId: body?.customer.customer_id?.toString() ?? "",
                name: body?.customer.customer_name?.toString() ?? "",
                email: body?.customer.customer_email?.toString() ?? "",
                phone: body?.customer.customer_phone?.toString() ?? ""
            },
        };

        // ✅ Make POST request to PayU API
        const response = await fetch(`https://uatoneapi.payu.in/payment-links/`, {
            method: "POST",
            headers: {
                "merchantId": process.env.PAYU_MERCHANT_ID!,
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        console.log("PayU Payload:", JSON.stringify(payload, null, 2));


        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to create payment link", details: data },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 200 });



    } catch (err) {
        console.error("PayU error:", err.response?.data || err.message);
        return new Response(
            JSON.stringify({ error: "Failed to create payment link", details: err.response?.data }),
            { status: err.response?.status || 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
