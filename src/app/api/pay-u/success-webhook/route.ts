import crypto from "crypto";
import { NextResponse } from "next/server";

const PAYU_KEY = process.env.PAYU_KEY;
const PAYU_SALT = process.env.PAYU_SALT;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let data = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      data = Object.fromEntries(formData);
    } else if (contentType.includes("application/json")) {
      data = await req.json();
    }

    console.log("🚀 PayU Webhook Received:", data);

    if (data.hash && PAYU_KEY && PAYU_SALT) {
      const generatedHash = generateReverseHash(data);
      if (generatedHash !== data.hash) {
        console.error("❌ Hash verification failed");
        return new Response("Invalid hash", { status: 400, headers: corsHeaders });
      }
      console.log("✅ Hash verified");
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response("Webhook Error", { status: 500, headers: corsHeaders });
  }
}

function generateReverseHash(data) {
  const hashString = `${PAYU_SALT}|${data.status}|||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${data.email || ""}|${data.firstname || ""}|${data.productinfo || ""}|${data.amount || ""}|${data.txnid || ""}|${PAYU_KEY}`;
  const sha = crypto.createHash("sha512").update(hashString).digest("hex");
  return sha.toLowerCase();
}
