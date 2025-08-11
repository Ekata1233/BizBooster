import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";
import mongoose from "mongoose";
import axios from "axios";
import User from "@/models/User";
import { Package } from "@/models/Package";
import Lead from "@/models/Lead";

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

    // console.log("✅ Webhook Received:", body);

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
      const checkout = await Checkout.findById(checkoutId);

      console.log("payed amount : ", payment_amount);

      if (checkout) {
        const paid = Number(payment_amount);
        const total = Number(checkout.grandtotal ?? checkout.totalAmount ?? 0);
        const remaining = total - paid;

        console.log("paid   : ", paid);
        console.log("total   : ", total);

        checkout.cashfreeMethod = payment_group;
        checkout.paidAmount = (checkout.paidAmount || 0) + paid;
        checkout.remainingAmount = Math.max(total - checkout.paidAmount, 0);
        const isFullPayment = checkout.paidAmount >= total;
        checkout.paymentStatus = isFullPayment ? "paid" : "pending";
        checkout.isPartialPayment = !isFullPayment;

        await checkout.save();


        console.log("remaining amount  : ", checkout.remainingAmount);



        const existingLead = await Lead.findOne({ checkout: checkoutId });

        if (existingLead) {
          // Normalize and include timestamps
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
            const description =
              checkout.isPartialPayment
                ? "Payment verified (Partial) via Cashfree"
                : "Payment verified (Full) via Cashfree";

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

        console.log("after existing lead : ", existingLead)

      } else {
        console.warn(`⚠️ No Checkout found for checkoutId: ${checkoutId}`);
      }
    }

    const myCustomerId = body?.data?.order?.order_tags?.customer_id;
    if (payment_status === "SUCCESS" && myOrderId?.startsWith("package_") && myCustomerId) {
      try {

        const amountPaid = Number(payment_amount);

        const pkg = await Package.findOne();
        if (!pkg || typeof pkg.price !== "number") {
          return NextResponse.json(
            { success: false, message: "Valid package not found." },
            { status: 400, headers: corsHeaders }
          );
        }

        const fullPackageAmount = pkg.grandtotal;

        console.log("full packge amount : ", fullPackageAmount)

        const user = await User.findById(myCustomerId);
        if (!user) throw new Error("User not found");

        const newTotalPaid = (user.packageAmountPaid || 0) + amountPaid;

        console.log("newTotalPaid : ", newTotalPaid)


        // ✅ Set packagePrice only once during the first partial payment
        if ((user.packagePrice ?? 0) === 0 && newTotalPaid < fullPackageAmount) {
          user.packagePrice = fullPackageAmount;
          console.log("packagePrice : ", user.packagePrice)

        }

        // ✅ Ensure remainingAmount is based on the correct packagePrice (even if it was set earlier)
        const effectivePackagePrice = user.packagePrice > 0 ? user.packagePrice : fullPackageAmount;

        console.log("effectivePackagePrice : ", effectivePackagePrice)

        const remaining = effectivePackagePrice - newTotalPaid;
        console.log("remaining : ", remaining)


        user.packageAmountPaid = newTotalPaid;
        user.remainingAmount = Math.max(remaining, 0);
        user.packageType = newTotalPaid >= effectivePackagePrice ? "full" : "partial";

        // ✅ Trigger commission only if fully paid and not already active
        if (newTotalPaid >= effectivePackagePrice && !user.packageActive) {
          try {
            await axios.post(
              "https://biz-booster.vercel.app/api/distributePackageCommission",
              { userId: user._id }
            );
          } catch (err: any) {
            console.error("❌ Failed to distribute package commission:", err?.response?.data || err.message);
          }
        }

        await user.save();

        // console.log("✅ User payment info updated");
      } catch (err: any) {
        console.error("❌ Failed to distribute package commission:", err?.response?.data || err.message);
      }
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("❌ Webhook Error:", error.message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500, headers: corsHeaders });
  }
}
