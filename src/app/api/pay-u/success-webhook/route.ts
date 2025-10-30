import Checkout from "@/models/Checkout";
import Lead from "@/models/Lead";
import { Package } from "@/models/Package";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { connectToDatabase } from "@/utils/db";
import crypto from "crypto";
import { NextResponse } from "next/server";
import axios from 'axios';

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

function roundToTwo(num) {
    return Number(num.toFixed(2));
}

export async function POST(req) {
    try {
        await connectToDatabase();

        const contentType = req.headers.get("content-type") || "";
        let data = {};

        if (contentType.includes("application/x-www-form-urlencoded")) {
            const formData = await req.formData();
            data = Object.fromEntries(formData);
        } else if (contentType.includes("application/json")) {
            data = await req.json();
        }

        // console.log("🚀 PayU Webhook Received:", data);

        // console.log("Expected Hash:", data.hash);

        // if (data.hash && PAYU_KEY && PAYU_SALT) {
        //     const generatedHash = generateReverseHash(data);
        //     if (generatedHash !== data.hash) {
        //         console.error("❌ Hash verification failed");
        //         return new Response("Invalid hash", { status: 400, headers: corsHeaders });
        //     }
        //     console.log("✅ Hash verified");
        // }

        // console.log("Generated Hash:", generateReverseHash(data));

        // --- Extract PayU identifiers ---
        const orderId = data.udf1;     // your order id
        const checkoutId = data.udf2;  // checkout id
        const customerId = data.udf3;  // customer id
        const paymentStatus = data.status.toUpperCase();
        const paymentAmount = Number(data.amount);
        const paymentMethod = data.mode;

        console.log(" amount paid : ", paymentAmount)

        if (!orderId || !paymentStatus) {
            return NextResponse.json({ error: "Missing order_id or payment_status" }, { status: 400, headers: corsHeaders });
        }

        // --- Payment record update ---
        await Payment.findOneAndUpdate(
            { order_id: orderId },
            {
                payment_id: data.mihpayid,
                amount: paymentAmount,
                status: paymentStatus,
                name: data.firstname,
                email: data.email,
                phone: data.phone,
                payment_method: paymentMethod,
            },
            { upsert: true, new: true }
        );

        // --- Checkout updates ---
        if (paymentStatus === "SUCCESS" && orderId?.startsWith("checkout_") && checkoutId) {
            const checkout = await Checkout.findById(checkoutId);
            if (checkout) {
                const total = checkout.grandTotal && checkout.grandTotal > 0
                    ? Number(checkout.grandTotal)
                    : Number(checkout.totalAmount ?? 0);

                checkout.cashfreeMethod = paymentMethod; // keeping naming consistent
                // checkout.paidAmount = (checkout.paidAmount || 0) + paymentAmount;
                // checkout.remainingAmount = roundToTwo(Math.max(total - checkout.paidAmount, 0));
                checkout.paidAmount = roundToTwo((checkout.paidAmount || 0) + paymentAmount);
                checkout.remainingAmount = roundToTwo(Math.max(total - checkout.paidAmount, 0));
                if (checkout.remainingAmount < 0.01) checkout.remainingAmount = 0;
                const isFullPayment = checkout.paidAmount >= total;
                checkout.paymentStatus = isFullPayment ? "paid" : "pending";
                // checkout.isPartialPayment = !isFullPayment;
                console.log("remaining amount : ", checkout.remainingAmount);

                if (!isFullPayment) {
                    checkout.isPartialPayment = true;
                } else {
                    checkout.isPartialPayment = false;
                }

                await checkout.save();

                // --- Lead updates ---
                let leadDoc = await Lead.findOne({ checkout: checkoutId });
                if (!leadDoc) leadDoc = new Lead({ checkout: checkoutId, leads: [] });

                leadDoc.leads.push({
                    statusType: "Payment verified",
                    description: `Payment verified ${paymentAmount} Rs (${checkout.isPartialPayment ? "Partial" : "Full"}) via PayU`,
                    createdAt: new Date(),
                });

                await leadDoc.save();

                // --- Prevent duplicate verification entries ---
                const existingLead = await Lead.findOne({ checkout: checkoutId });

                if (existingLead) {
                    // Normalize and map timestamps
                    const leadUpdates = existingLead.leads.map((l: any) => ({
                        statusType: (l.statusType || "").toLowerCase(),
                        createdAt: new Date(l.createdAt || 0),
                    }));

                    // Find all "payment request" entries
                    const paymentRequests = leadUpdates
                        .filter((l: { statusType: string }) => l.statusType === "payment request (partial/full)")
                        .sort((a: { createdAt: Date }, b: { createdAt: Date }) => b.createdAt.getTime() - a.createdAt.getTime());

                    // Find the most recent "payment verified"
                    const latestVerified = leadUpdates
                        .filter((l: { statusType: string }) => l.statusType === "payment verified")
                        .sort((a: { createdAt: Date }, b: { createdAt: Date }) => b.createdAt.getTime() - a.createdAt.getTime())[0];

                    const newestRequest = paymentRequests[0];

                    const shouldAddNewVerification =
                        !latestVerified || (newestRequest && newestRequest.createdAt > latestVerified.createdAt);

                    if (shouldAddNewVerification) {
                        const description = checkout.isPartialPayment
                            ? "Payment verified (Partial) via PayU"
                            : "Payment verified (Full) via PayU";

                        existingLead.leads.push({
                            statusType: "Payment verified",
                            description,
                            createdAt: new Date(),
                        });

                        await existingLead.save();
                        console.log("✅ New 'Payment verified' added after latest payment request");
                    } else {
                        console.log("ℹ️ Payment already verified for latest request");
                    }
                }

                console.log("after existing lead : ", existingLead);
            } else {
                console.warn(`⚠️ No Checkout found for checkoutId: ${checkoutId}`);
            }
        } else if (paymentStatus === "FAILED" && checkoutId) {
            const checkout = await Checkout.findById(checkoutId);
            if (checkout) {
                checkout.paymentStatus = "failed";
                const total = checkout.grandTotal && checkout.grandTotal > 0
                    ? Number(checkout.grandTotal)
                    : Number(checkout.totalAmount ?? 0);

                checkout.remainingAmount = roundToTwo(Math.max(total - (checkout.paidAmount || 0), 0));
                if (checkout.remainingAmount < 0.01) checkout.remainingAmount = 0;
                if (checkout.paidAmount > 0 && checkout.paidAmount < total) {
                    checkout.isPartialPayment = true;
                } else {
                    checkout.isPartialPayment = false;
                }
                await checkout.save();

                let leadDoc = await Lead.findOne({ checkout: checkoutId });
                if (!leadDoc) leadDoc = new Lead({ checkout: checkoutId, leads: [] });

                leadDoc.leads.push({
                    statusType: "Payment failed",
                    description: `Payment of ₹${paymentAmount} failed via PayU`,
                    createdAt: new Date(),
                });

                await leadDoc.save();
            }
        }

        // --- Customer package handling ---
        if (paymentStatus === "SUCCESS" && orderId?.startsWith("package_") && customerId) {
            try {
                const amountPaid = Number(paymentAmount);

                const pkg = await Package.findOne();
                if (!pkg || typeof pkg.price !== "number") {
                    console.warn("❌ Valid package not found");
                }

                const fullPackageAmount = pkg?.grandtotal ?? 0;
                const user = await User.findById(customerId);
                if (!user) throw new Error("User not found");

                const newTotalPaid = (user.packageAmountPaid || 0) + amountPaid;

                if ((user.packagePrice ?? 0) === 0 && newTotalPaid < fullPackageAmount) {
                    user.packagePrice = fullPackageAmount;
                }

                const effectivePackagePrice = user.packagePrice > 0 ? user.packagePrice : fullPackageAmount;
                const remaining = effectivePackagePrice - newTotalPaid;

                user.packageAmountPaid = newTotalPaid;
                user.remainingAmount = roundToTwo(Math.max(remaining, 0));
                if (user.remainingAmount < 0.01) user.remainingAmount = 0;

                user.packageType = newTotalPaid >= effectivePackagePrice ? "full" : "partial";

                // Trigger commission if fully paid
                if (newTotalPaid >= effectivePackagePrice && !user.packageActive) {
                    try {
                        await axios.post(
                            "https://api.fetchtrue.com/api/distributePackageCommission",
                            { userId: user._id }
                        );
                    } catch (err: any) {
                        console.error("❌ Failed to distribute package commission:", err?.response?.data || err.message);
                    }
                }

                await user.save();
            } catch (err: any) {
                console.error("❌ Customer package processing failed:", err?.response?.data || err.message);
            }
        }

        return NextResponse.json({ success: true }, { headers: corsHeaders });

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
