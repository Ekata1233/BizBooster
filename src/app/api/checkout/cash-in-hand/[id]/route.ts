import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Checkout from "@/models/Checkout";
import ProviderWallet from "@/models/ProviderWallet";
import Lead from "@/models/Lead";
import mongoose from "mongoose";
import ProviderPayout from "@/models/ProviderPayout";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

type LeadEntry = {
    statusType?: string;
    description?: string;
    createdAt?: string | number | Date;
};

function getWeekRange(date = new Date()) {
  const day = date.getDay();
  const diffToThursday = day >= 4 ? day - 4 : day + 3; 
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - diffToThursday);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}


const round2 = (num: number) => Number(num.toFixed(2));

// ✅ helper: normalize all numeric fields to 2 decimals recursively
const normalizeDecimals = (obj: any) => {
  if (!obj || typeof obj !== "object") return;
  if (obj instanceof mongoose.Document || obj instanceof mongoose.Types.ObjectId) return;

  for (const key of Object.keys(obj)) {
    if (key.startsWith("_") || key === "id" || key === "$__" || key === "schema") continue;

    const val = obj[key];
    try {
      if (typeof val === "number" && !isNaN(val)) {
        obj[key] = round2(val);
      } else if (Array.isArray(val)) {
        val.forEach((item) => normalizeDecimals(item));
      } else if (typeof val === "object") {
        normalizeDecimals(val);
      }
    } catch {
      continue;
    }
  }
};


export async function PUT(req: NextRequest) {
    await connectToDatabase();

    try {
        const url = new URL(req.url);
        const id = url.pathname.split("/").pop();
        const body = await req.json();
        const statusTypeFromClient = body.statusType || null;
        const paymentType = body.paymentKind || null;
        const bodyAmount = body.amount ?? null;

        console.log("body of the cash in hand : ", body);

        const fetchedAmount =
            paymentType === "partial"
                ? round2(bodyAmount ?? 0) / 2
                : paymentType === "full" || paymentType === "remaining"
                ? round2(bodyAmount ?? 0)
                : 0;

        console.log("Fetched Amount:", fetchedAmount);

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Missing checkout ID." },
                { status: 400, headers: corsHeaders }
            );
        }

        // 1️⃣ Find Checkout
        const checkout = await Checkout.findById(id);
        if (!checkout) {
            return NextResponse.json(
                { success: false, message: "Checkout not found." },
                { status: 404, headers: corsHeaders }
            );
        }

        console.log("🔎 Checkout Found:", checkout);

        const total = round2(
            checkout.grandTotal && checkout.grandTotal > 0
                ? Number(checkout.grandTotal)
                : Number(checkout.totalAmount ?? 0)
        );

          console.log("🧮 Total Checkout Amount:", total);
        console.log("💰 Previous Paid Amount:", checkout.paidAmount);

        checkout.cashInHand = true;
        checkout.cashInHandAmount = round2((checkout.cashInHandAmount || 0) + fetchedAmount);
        checkout.paidAmount = round2((checkout.paidAmount || 0) + fetchedAmount);
        checkout.remainingAmount = round2(Math.max(total - checkout.paidAmount, 0));
        const isFullPayment = checkout.paidAmount >= total;
        checkout.paymentStatus = isFullPayment ? "paid" : "pending";
        checkout.isPartialPayment = !isFullPayment;

                console.log("💰 Updated Paid Amount:", checkout.paidAmount);
        console.log("⏳ Remaining Amount:", checkout.remainingAmount);
        
        console.log("📌 Payment Status:", checkout.paymentStatus);
        console.log("📌 Is Partial:", checkout.isPartialPayment);


        if (statusTypeFromClient === "Lead completed") {
            checkout.orderStatus = "completed";
            checkout.isCompleted = true;
        }

        normalizeDecimals(checkout);
        await checkout.save();

        // 2️⃣ Update Lead
        const existingLead = await Lead.findOne({ checkout: id });

        if (existingLead) {
            type LeadWithIndex = { lead: LeadEntry; idx: number };

            const latestPaymentRequest = existingLead.leads
                .map((l: LeadEntry, idx: number) => ({ lead: l, idx }))
                .filter(
                    (entry: LeadWithIndex) =>
                        entry.lead.statusType?.toLowerCase().trim() === "payment request (partial/full)"
                )
                .sort((a: LeadWithIndex, b: LeadWithIndex) => {
                    const aTime = new Date(a.lead.createdAt ?? 0).getTime();
                    const bTime = new Date(b.lead.createdAt ?? 0).getTime();
                    return bTime - aTime;
                })[0];

            if (latestPaymentRequest && typeof latestPaymentRequest.idx === "number") {
                const idx = latestPaymentRequest.idx;
                existingLead.leads[idx].description = "Customer made payment to provider via cash in hand";
                existingLead.leads[idx].paymentLink = "";
            }

            const now = new Date();
            const description =
                paymentType === "partial"
                    ? `Payment verified (Partial - ${fetchedAmount}) via Customer - Cash in hand`
                    : `Payment verified (Full - ${fetchedAmount}) via Customer - Cash in hand`;

            existingLead.leads.push({
                statusType: "Payment verified",
                description,
                createdAt: now,
            });

            await existingLead.save();
        }

        // 3️⃣ Update Provider Wallet
        const providerWallet = await ProviderWallet.findOne({ providerId: checkout.provider });
        console.log("🔎 Provider Wallet Found:", providerWallet);
        if (!providerWallet) {
            return NextResponse.json(
                { success: false, message: "Provider wallet not found." },
                { status: 404, headers: corsHeaders }
            );
        }

        const prevBalance = round2(providerWallet.balance || 0);
         console.log("💰 Previous Wallet Balance:", prevBalance);
        let remainingCash = 0;
        let newBalance = round2(prevBalance - fetchedAmount);

        if (newBalance < 0) {
            remainingCash = Math.abs(newBalance);
            newBalance = 0;
        }

        console.log("💸 New Wallet Balance:", newBalance);
        console.log("⚖️ Remaining Cash Adjustment:", remainingCash);

        if (!Array.isArray(providerWallet.transactions)) {
            providerWallet.transactions = [];
        }

        providerWallet.adjustmentCash = round2((providerWallet.adjustmentCash || 0) + remainingCash);

        const newCashInHand = round2((providerWallet.cashInHand || 0) + fetchedAmount);
        const newWithdrawableBalance = round2(
            Math.max((providerWallet.withdrawableBalance || 0) - fetchedAmount, 0)
        );
        const newPendingWithdraw = round2(
            Math.max((providerWallet.pendingWithdraw || 0) - fetchedAmount, 0)
        );

        providerWallet.cashInHand = newCashInHand;
        providerWallet.withdrawableBalance = newWithdrawableBalance;
        providerWallet.pendingWithdraw = newPendingWithdraw;
        providerWallet.balance = newBalance;

         console.log("🏦 Updated Wallet Values:");
        console.log("   cashInHand:", providerWallet.cashInHand);
        console.log("   adjustmentCash:", providerWallet.adjustmentCash);
        console.log("   withdrawableBalance:", providerWallet.withdrawableBalance);
        console.log("   pendingWithdraw:", providerWallet.pendingWithdraw);
        console.log("   balance:", providerWallet.balance);

        providerWallet.transactions.push({
            type: "credit",
            amount: round2(fetchedAmount),
            description:
                remainingCash > 0
                    ? `Cash in hand received from customer (adjusted ₹${round2(remainingCash)} due to insufficient balance)`
                    : "Cash in hand received from customer",
            referenceId: checkout._id.toString(),
            method: "Cash",
            source: "checkout",
            status: "success",
            balanceAfterTransaction: newBalance,
            createdAt: new Date(),
            leadId: checkout.bookingId,
        });

        const deductedFromBalance = round2(fetchedAmount - remainingCash);
        providerWallet.totalEarning = round2((providerWallet.totalEarning || 0) - deductedFromBalance);
        providerWallet.totalCredits = round2((providerWallet.totalCredits || 0) - deductedFromBalance);

        normalizeDecimals(providerWallet);
        await providerWallet.save();

        try {
      const { weekStart, weekEnd } = getWeekRange();
            const providerId = checkout.provider;

            await ProviderPayout.findOneAndUpdate(
                { providerId, weekStart: weekStart, weekEnd: weekEnd },
                {
                    $inc: { pendingWithdraw: fetchedAmount },
                    $setOnInsert: { status: "pending" },
                },
                { upsert: true, new: true }
            );
        } catch (err) {
            console.error("⚠️ Failed to update ProviderPayout:", err);
        }

        return NextResponse.json(
            {
                success: true,
                message: "Checkout, provider wallet, and lead status updated successfully.",
                data: {
                    checkout,
                    providerWallet,
                },
            },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("❌ Error in PUT handler:", error);
        return NextResponse.json(
            { success: false, message: "Server error." },
            { status: 500, headers: corsHeaders }
        );
    }
}
