import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import mongoose from "mongoose";
import Payment from "@/models/Payment"; // Your Mongoose Payment model
import { Package } from "@/models/Package";
import User from "@/models/User";

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
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");
    const amount = searchParams.get("amount");

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing order_id" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("✅ SMEPay GET callback:", { orderId, amount });

    // 1️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!);

    // 2️⃣ Lookup slug from DB using order_id
    const payment = await Payment.findOne({ order_id: orderId });
    if (!payment || !payment.slug) {
      return NextResponse.json(
        { error: "Payment slug not found for order_id" },
        { status: 404, headers: corsHeaders }
      );
    }
    const slug = payment.slug;

    console.log("Found slug in DB:", slug);

    // 1️⃣ Authenticate with SMEPay
    const authResponse = await axios.post(
      "https://apps.typof.com/api/external/auth",
      {
        client_id: process.env.SMEPAY_CLIENT_ID,
        client_secret: process.env.SMEPAY_CLIENT_SECRET,
      }
    );
    const token = authResponse.data.access_token;
    console.log("token : ", token)
    if (!token) {
      return NextResponse.json(
        { error: "SMEPay token not found" },
        { status: 500, headers: corsHeaders }
      );
    }

    // 2️⃣ Validate order with SMEPay
    const validateResponse = await axios.post(
      "https://apps.typof.com/api/external/validate-order",
      {
        client_id: process.env.SMEPAY_CLIENT_ID,
        slug: slug,
        amount: amount,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paymentStatus = validateResponse.data?.payment_status || "unknown";
    console.log("🔍 Payment validated (GET):", paymentStatus);

    await Payment.findOneAndUpdate(
      { order_id: orderId },
      {
        status: paymentStatus,             
        amount: amount ? Number(amount) : payment.amount, 
        payment_time: paymentStatus === "SUCCESS" ? new Date() : payment.payment_time, 
      },
      { new: true }
    );

    console.log("customer Id : ", payment.customerId)
    // ------------------------------
    // ✅ Package payment logic
    // ------------------------------
    if (
      paymentStatus === "paid" &&
      orderId.startsWith("package_") &&
      payment.customerId
    ) {
      try {
        const amountPaid = Number(amount);

        const pkg = await Package.findOne();
        if (!pkg || typeof pkg.grandtotal !== "number") {
          console.warn("Valid package not found.");
        } else {
          const fullPackageAmount = pkg.grandtotal;
          console.log("full package amount:", fullPackageAmount);

          const user = await User.findById(payment.customerId);
          if (!user) throw new Error("User not found");

          const newTotalPaid = (user.packageAmountPaid || 0) + amountPaid;
          console.log("newTotalPaid:", newTotalPaid);

          // Set packagePrice only once during first partial payment
          if ((user.packagePrice ?? 0) === 0 && newTotalPaid < fullPackageAmount) {
            user.packagePrice = fullPackageAmount;
            console.log("packagePrice set:", user.packagePrice);
          }

          const effectivePackagePrice = user.packagePrice > 0 ? user.packagePrice : fullPackageAmount;
          const remaining = effectivePackagePrice - newTotalPaid;
          console.log("remaining:", remaining);

          user.packageAmountPaid = newTotalPaid;
          user.remainingAmount = Math.max(remaining, 0);
          user.packageType = newTotalPaid >= effectivePackagePrice ? "full" : "partial";

          // Trigger commission if fully paid and not active
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
        }
      } catch (err: any) {
        console.error("❌ Package payment processing error:", err?.response?.data || err.message);
      }
    }

    return NextResponse.json(
      { success: true, source: "GET", orderId, amount, paymentStatus },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("SMEPay GET callback error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data || "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// NOT WORKING
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // console.log("body : ", body);

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
    // console.log('authResponse : ', authResponse)

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
        amount: amount,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("validate repsonce : ", validateResponse)

    const status = validateResponse.data?.payment_status || "unknown";
    console.log("status : ", status);

    // 3️⃣ Save payment status in DB
    // await mongoose.connect(process.env.MONGODB_URI || "");
    // const payment = await Payment.findOneAndUpdate(
    //   { order_id: orderId || slug },
    //   {
    //     order_id: orderId || slug,
    //     slug: slug,
    //     amount: amount,
    //     status: status,
    //     updatedAt: new Date(),
    //   },
    //   { upsert: true, new: true }
    // );

    // console.log("Payment validated and saved:", payment);

    // 4️⃣ Respond with success
    return NextResponse.json(
      { success: true, status: status },
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
