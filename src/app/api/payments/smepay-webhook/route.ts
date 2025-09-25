import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import mongoose from "mongoose";
import Payment from "@/models/Payment"; // Your Mongoose Payment model

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Allow preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET handler (prevents 405)
export async function GET(req: NextRequest) {
  return NextResponse.json(
    { message: "SMEPay webhook ready. Use POST for payment validation." },
    { status: 200, headers: corsHeaders }
  );
}

// Handle GET/POST callback from SMEpay
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("body : ", body);

    // Extract data from SMEpay callback
    const slug = body.slug || body.order_slug || body.order_id;
    const orderId = body.order_id || null;
    const amount = body.amount || null;


        console.log("slug : ", slug);
    console.log("amount : ", amount);


    if (!slug) {
      return NextResponse.json(
        { error: "Missing order slug" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1️⃣ Authenticate with SMEpay
    const authResponse = await axios.post(
      "https://apps.typof.com/api/external/auth",
      {
        client_id: process.env.SMEPAY_CLIENT_ID,
        client_secret: process.env.SMEPAY_CLIENT_SECRET,
      }
    );

    const token = authResponse.data.access_token;
    console.log('token : ', token)
    if (!token) {
      return NextResponse.json(
        { error: "SMEPay token not found" },
        { status: 500, headers: corsHeaders }
      );
    }

    // 2️⃣ Validate order
    const validateResponse = await axios.post(
      "https://apps.typof.com/api/external/validate-order",
      {
        client_id: process.env.SMEPAY_CLIENT_ID,
        slug: slug,
        amount: amount, // optional, if SMEpay requires
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("validate repsonce : ", validateResponse)

    const status = validateResponse.data?.status || "unknown";

    console.log("staus : ", status)
    // 3️⃣ Save payment status in DB
    await mongoose.connect(process.env.MONGODB_URI || "");
    const payment = await Payment.findOneAndUpdate(
      { order_id: orderId || slug },
      {
        order_id: orderId || slug,
        slug: slug,
        amount: amount,
        status: status,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log("Payment validated and saved:", payment);

    // 4️⃣ Respond with success
    return NextResponse.json(
      { success: true, status: status, payment },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("SMEPay callback error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data || "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
