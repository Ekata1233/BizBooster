import Checkout from "@/models/Checkout";
import Lead from "@/models/Lead";
import { Package } from "@/models/Package";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { connectToDatabase } from "@/utils/db";
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
        await connectToDatabase();
    
    const contentType = req.headers.get("content-type") || "";
    let data = {};

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      data = Object.fromEntries(formData);
    } else if (contentType.includes("application/json")) {
      data = await req.json();
    }

    console.log("🚀 PayU Webhook Received:", data);

    console.log("Expected Hash:", data.hash);

    if (data.hash && PAYU_KEY && PAYU_SALT) {
      const generatedHash = generateReverseHash(data);
      if (generatedHash !== data.hash) {
        console.error("❌ Hash verification failed");
        return new Response("Invalid hash", { status: 400, headers: corsHeaders });
      }
      console.log("✅ Hash verified");
    }

    console.log("Generated Hash:", generateReverseHash(data));

        // --- Extract PayU identifiers ---
    const orderId = data.udf1;     // your order id
    const checkoutId = data.udf2;  // checkout id
    const customerId = data.udf3;  // customer id
    const paymentStatus = data.status.toUpperCase();
    const paymentAmount = Number(data.amount);
    const paymentMethod = data.mode;

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
        checkout.paidAmount = (checkout.paidAmount || 0) + paymentAmount;
        checkout.remainingAmount = Math.max(total - checkout.paidAmount, 0);
        const isFullPayment = checkout.paidAmount >= total;
        checkout.paymentStatus = isFullPayment ? "paid" : "pending";
        checkout.isPartialPayment = !isFullPayment;

        await checkout.save();

        // --- Lead updates ---
        let leadDoc = await Lead.findOne({ checkout: checkoutId });
        if (!leadDoc) leadDoc = new Lead({ checkout: checkoutId, leads: [] });

        // Check existing leads for duplicate verification
        const latestVerified = leadDoc.leads
          .filter(l => l.statusType.toLowerCase() === "payment verified")
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        const paymentRequests = leadDoc.leads
          .filter(l => l.statusType.toLowerCase() === "payment request (partial/full)")
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const newestRequest = paymentRequests[0];
        const shouldAddNewVerification = !latestVerified || (newestRequest && new Date(newestRequest.createdAt) > new Date(latestVerified.createdAt));

        if (shouldAddNewVerification) {
          leadDoc.leads.push({
            statusType: "Payment verified",
            description: `Payment verified ${paymentAmount} Rs (${checkout.isPartialPayment ? "Partial" : "Full"}) via PayU`,
            createdAt: new Date(),
          });
          await leadDoc.save();
        }
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

        checkout.remainingAmount = Math.max(total - (checkout.paidAmount || 0), 0);
        checkout.isPartialPayment = checkout.paidAmount > 0 && checkout.paidAmount < total;
        await checkout.save();
      }
    }

    // --- Customer package handling ---
    if (paymentStatus === "SUCCESS" && customerId) {
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
        user.remainingAmount = Math.max(remaining, 0);
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
