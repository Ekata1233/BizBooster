// import { NextRequest, NextResponse } from "next/server";
// import axios from "axios";

// const corsHeaders = {
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//     return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function POST(req: NextRequest) {
//     try {
//         const body = await req.json();
//         const { name, email, mobile, amount, userId } = body;

//         if (!name || !email || !mobile || !amount || !userId) {
//             return NextResponse.json(
//                 { error: "Missing required fields" },
//                 { status: 400, headers: corsHeaders }
//             );
//         }

//         console.log('SMEPAY_CLIENT_ID set?', !!process.env.SMEPAY_CLIENT_ID);
//         console.log('SMEPAY_CLIENT_SECRET set?', !!process.env.SMEPAY_CLIENT_SECRET);


//         // ✅ Step 1: Authenticate to get access_token
//         const authRes = await axios.post("https://apps.typof.com/api/external/auth", {
//             client_id: process.env.SMEPAY_CLIENT_ID,
//             client_secret: process.env.SMEPAY_CLIENT_SECRET,
//         });

//         const accessToken = authRes.data.access_token;

//         // ✅ Step 2: Create Order using access_token
//         const orderPayload = {
//             client_id: process.env.SMEPAY_CLIENT_ID,
//             amount: parseFloat(amount).toFixed(2),
//             order_id: `ORDER-${Date.now()}`,
//             callback_url: "https://biz-booster.vercel.app/payment-success",
//             customer_details: {
//                 email,
//                 mobile,
//                 name,
//                 userId
//             },
//         };

//         const orderRes = await axios.post(
//             "https://apps.typof.com/api/external/create-order",
//             orderPayload,
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${accessToken}`,
//                 },
//             }
//         );

//         const { order_slug, message } = orderRes.data;

//         const qrRes = await axios.post(
//             "https://apps.typof.com/api/external/generate-qr",
//             {
//                 slug: order_slug,
//                 client_id: process.env.SMEPAY_CLIENT_ID,
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     "Content-Type": "application/json",
//                 },
//             }
//         );


//         const { qrcode, link, ref_id, data } = qrRes.data;

//         return NextResponse.json(
//             {
//                 status: true,
//                 message,
//                 order_slug,
//                 ref_id,
//                 amount: data.amount,
//                 payment_status: data.payment_status,
//                 qrcode, // base64 QR code image
//                 upi_links: link, // { gpay, phonepe, paytm, bhim }
//             },
//             { headers: corsHeaders }
//         );
//     } catch (err: any) {
//         console.error("SMEpay Error:", err.response?.data || err.message);
//         return NextResponse.json(
//             { error: "Failed to create SMEpay order" },
//             { status: 500, headers: corsHeaders }
//         );
//     }
// }


// import { NextRequest, NextResponse } from "next/server";
// import axios from "axios";

// const corsHeaders = {
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//     return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function POST(req: NextRequest) {
//     try {
//         const body = await req.json();
//         const { name, email, mobile, amount, userId } = body;

//         if (!name || !email || !mobile || !amount || !userId) {
//             return NextResponse.json(
//                 { error: "Missing required fields" },
//                 { status: 400, headers: corsHeaders }
//             );
//         }

//         // ✅ Step 1: Authenticate to get token
//         const authRes = await axios.post("https://apps.typof.com/api/external/auth", {
//             client_id: process.env.SMEPAY_CLIENT_ID,
//             client_secret: process.env.SMEPAY_CLIENT_SECRET,
//         });

//         // console.log("auth res : ", authRes)
//         const token = authRes.data.access_token;
//         console.log("auth token : ", token)

//         // ✅ Step 2: Create Order
//         const orderPayload = {
//             client_id: process.env.SMEPAY_CLIENT_ID,
//             amount: parseFloat(amount).toFixed(2),
//             order_id: `ORDER-${Date.now()}`,
//             callback_url: "https://biz-booster.vercel.app/api/payments/smepay-webhook",
//             customer_details: {
//                 email,
//                 mobile,
//                 name,
//             },
//         };

//         const orderRes = await axios.post(
//             "https://apps.typof.com/api/external/create-order",
//             orderPayload,
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                   Authorization: `Bearer ${token}`,
//                 },
//             }
//         );

//         const { order_slug, message, data } = orderRes.data;

//         // ✅ Step 3 (Optional): Generate QR
//         const qrRes = await axios.post(
//             "https://apps.typof.com/api/external/generate-qr",
//             {
//                 slug: order_slug,
//                 client_id: process.env.SMEPAY_CLIENT_ID,
//             },
//             {
//                 headers: {
//                     Authorization: `Token ${token}`,
//                     "Content-Type": "application/json",
//                 },
//             }
//         );

//         const { qrcode, link, ref_id } = qrRes.data;

//         return NextResponse.json(
//             {
//                 status: true,
//                 message,
//                 order_slug,
//                 ref_id,
//                 amount: data?.amount,
//                 payment_status: data?.payment_status,
//                 qrcode,       // base64 QR code
//                 upi_links: link, // { gpay, phonepe, paytm, bhim }
//             },
//             { headers: corsHeaders }
//         );
//     } catch (err: any) {
//         console.error("SMEpay Error:", err.response?.data || err.message);
//         return NextResponse.json(
//             { error: "Failed to create SMEpay order" },
//             { status: 500, headers: corsHeaders }
//         );
//     }
// }


import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import Payment from "@/models/Payment";
import mongoose from "mongoose";

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
        const order_id = `package_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        // 1. Authenticate and get token
        const authResponse = await axios.post("https://apps.typof.com/api/external/auth", {
            client_id: process.env.SMEPAY_CLIENT_ID,
            client_secret: process.env.SMEPAY_CLIENT_SECRET,
        });

        const token = authResponse.data.access_token;

        console.log("taoken : ", token)
        if (!token) {
            return NextResponse.json(
                { error: "Token not found in auth response", raw: authResponse.data },
                { status: 400, headers: corsHeaders }
            );
        }

        const createdAt = new Date().toISOString();
        // 2. Create order using token
        const orderResponse = await axios.post(
            "https://apps.typof.com/api/external/create-order",
            {
                client_id: process.env.SMEPAY_CLIENT_ID,
                amount: body.amount,
                order_id: order_id,
                customerId: body.customerId,
                callback_url: `https://biz-booster.vercel.app/api/payments/smepay-webhook?order_id=${order_id}&amount=${body.amount}`,
                customer_details: body.customer_details,
            },
            {
                headers: {
                    // SMEPay doc says "Authorization: token : <value>"
                    // If that's literal → use below format, else use `Bearer ${token}`
                    Authorization: `Bearer ${token}`, "Content-Type": "application/json",
                },
            }
        );

        const data = orderResponse.data;
        console.log("order response data:", data);

        // 3. Save payment in DB (with slug)
        await mongoose.connect(process.env.MONGO_URI!);

        const payment = await Payment.findOneAndUpdate(
            { order_id: order_id },
            {
                order_id: order_id,
                amount: body.amount,
                status: "PENDING",
                name: body.customer_details?.name,
                email: body.customer_details?.email,
                phone: body.customer_details?.mobile,
                slug: data.order_slug, // 🔑 save SMEPay slug
                customerId: body.customerId,
            },
            { upsert: true, new: true }
        );

        console.log("Saved Payment:", payment);

        return NextResponse.json(orderResponse.data, { headers: corsHeaders });
    } catch (error: any) {
        console.error("SMEpay Error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: error.response?.data || "SMEPay request failed" },
            { status: 500, headers: corsHeaders }
        );
    }
}
