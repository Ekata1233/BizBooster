import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";
import mongoose from "mongoose";
import axios from "axios";
import User from "@/models/User";
import { Package } from "@/models/Package";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();

    console.log("✅ Webhook Received:", body);

    const {
      order: { order_id },
      payment: {
        cf_payment_id,
        payment_status,
        payment_amount,
        payment_currency,
        payment_group,
      },
      customer_details,
    } = body.data;

    if (!order_id || !payment_status) {
      return NextResponse.json({ error: "Missing order_id or payment_status" }, { status: 400, headers: corsHeaders });
    }

    // ✅ Update or create the payment record in your DB
    const updated = await Payment.findOneAndUpdate(
      { order_id },
      {
        payment_id: cf_payment_id,
        amount: payment_amount,
        currency: payment_currency,
        status: payment_status,
        name: customer_details?.customer_name,
        email: customer_details?.customer_email,
        phone: customer_details?.customer_phone,
        payment_method: payment_group,

      },
      { upsert: true, new: true }
    );

    const checkoutId = body?.data?.order?.order_tags?.checkout_id;
    const myOrderId = body?.data?.order?.order_tags?.my_order_id;
    console.log("checout I d : ", checkoutId)

    if (payment_status === "SUCCESS" && myOrderId?.startsWith("checkout_") && checkoutId) {
      const updatedCheckout = await Checkout.findOneAndUpdate(
        new mongoose.Types.ObjectId(checkoutId), {
        cashfreeMethod: [payment_group],
        paymentStatus: "paid",
      },
        { new: true }
      );
      console.log("updated checout OUt : ", updatedCheckout)
      if (updatedCheckout) {
        console.log(`✅ Updated Checkout for checkoutId: ${checkoutId}`);
      } else {
        console.warn(`⚠️ No Checkout found for checkoutId: ${checkoutId}`);
      }
    }



    const myCustomerId = body?.data?.order?.order_tags?.customer_id;
    if (payment_status === "SUCCESS" && myOrderId?.startsWith("package_") && myCustomerId) {
      try {
        // const distRes = await axios.post(
        //   "https://biz-booster.vercel.app/api/distributePackageCommission",
        //   { userId: myCustomerId }
        // );
        // console.log("📤 Commission distribution triggered:", distRes.data);
        const amountPaid = Number(payment_amount); // Assuming this is the latest payment

        const pkg = await Package.findOne(); // or use Package.findById(packageId) if you know the package
        if (!pkg || typeof pkg.price !== "number") {
          return NextResponse.json(
            { success: false, message: "Valid package not found." },
            { status: 400, headers: corsHeaders }
          );
        }

        const fullPackageAmount = pkg.discountedPrice;

        console.log("package amount : ", fullPackageAmount)

        const user = await User.findById(myCustomerId);
        if (!user) throw new Error("User not found");

        const newTotalPaid = (user.packageAmountPaid || 0) + amountPaid;
        console.log("paid amount  : ", newTotalPaid)
        const remaining = fullPackageAmount - newTotalPaid;
        console.log("remaining amount : ", remaining)

        user.packageAmountPaid = newTotalPaid;
        user.remainingAmount = Math.max(remaining, 0);
        user.packageType = newTotalPaid >= fullPackageAmount ? "full" : "partial";

        // If fully paid, activate the package and distribute commission
        if (newTotalPaid >= fullPackageAmount && !user.packageActive) {
          // user.packageActive = true;
          // user.isCommissionDistribute = true;

          // Trigger commission API
          try {
            const distRes = await axios.post(
              "https://biz-booster.vercel.app/api/distributePackageCommission",
              { userId: user._id }
            );
            console.log("📤 Commission distribution triggered:", distRes.data);
          } catch (err: any) {
            console.error("❌ Failed to distribute package commission:", err?.response?.data || err.message);
          }
        }

        await user.save();
        console.log("✅ User payment info updated");
      } catch (err: any) {
        console.error("❌ Failed to distribute package commission:", err?.response?.data || err.message);
      }
    }


    console.log("myOrderId : ", myOrderId)
    console.log("myCustomerId : ", myCustomerId)


    console.log(`📦 Payment ${payment_status} for order: ${order_id}`);
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("❌ Webhook Error:", error.message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500, headers: corsHeaders });
  }
}
