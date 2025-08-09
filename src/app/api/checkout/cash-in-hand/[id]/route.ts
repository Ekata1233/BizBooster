
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Checkout from "@/models/Checkout";
import ProviderWallet from "@/models/ProviderWallet";
import Lead from "@/models/Lead"; // ✅ Ensure Lead model is imported
import mongoose from "mongoose";

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
export async function PUT(req: NextRequest) {
    await connectToDatabase();

    try {
        const url = new URL(req.url);
        const id = url.pathname.split("/").pop();
        const body = await req.json();
        const statusTypeFromClient = body.statusType || null;
        const paymentType = body.paymentKind || null; // new
        const cashInHandAmount = body.amount ?? null;

        console.log("body of the cash in hand : ", body)

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Missing checkout ID." },
                { status: 400, headers: corsHeaders }
            );
        }

        // 1. Find Checkout
        const checkout = await Checkout.findById(id);
        if (!checkout) {
            return NextResponse.json(
                { success: false, message: "Checkout not found." },
                { status: 404, headers: corsHeaders }
            );
        }

        // 2. Update checkout fields for cash-in-hand
        const amount = checkout.remainingAmount || 0;
        checkout.paymentStatus = "paid";
        checkout.cashInHand = true;
        checkout.cashInHandAmount = amount;

        if (statusTypeFromClient === "Lead completed") {
            checkout.orderStatus = "completed";
            checkout.isCompleted = true;
        }

        await checkout.save();

        // 3. Update Lead status if cash-in-hand payment is latest
        const existingLead = await Lead.findOne({ checkout: id });

        if (existingLead) {
            console.log("existring lead : ", existingLead);

            existingLead.leads.forEach((l: LeadEntry, i: number) => {
                console.log(`Lead[${i}] statusType: '${l.statusType}'`);
            });

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

            console.log("latest payment request : ", latestPaymentRequest);

            if (latestPaymentRequest && typeof latestPaymentRequest.idx === "number") {
                const idx = latestPaymentRequest.idx;

                console.log("index of the status : ", idx);

                // ✅ Update description and blank paymentLink
                existingLead.leads[idx].description = "Customer made payment to provider via cash in hand";
                existingLead.leads[idx].paymentLink = "";
            }

            // ✅ Add "Payment verified" entry
            const now = new Date();
            const description = checkout.isPartialPayment
                ? "Payment verified (Partial) via Customer - Cash in hand"
                : "Payment verified (Full) via Customer - Cash in hand";

            existingLead.leads.push({
                statusType: "Payment verified",
                description,
                createdAt: now,
            });

            await existingLead.save();
            console.log("✅ Updated payment request description and added payment verified status.");
        }




        // 4. Update provider wallet
        const providerWallet = await ProviderWallet.findOne({ providerId: checkout.provider });
        if (!providerWallet) {
            return NextResponse.json(
                { success: false, message: "Provider wallet not found." },
                { status: 404, headers: corsHeaders }
            );
        }

        const prevBalance = providerWallet.balance || 0;
        const newBalance = prevBalance + amount;
        const newCashInHand = (providerWallet.cashInHand || 0) + amount;
        const newWithdrawableBalance = Math.max((providerWallet.withdrawableBalance || 0) - amount, 0);
        const newPendingWithdraw = Math.max((providerWallet.pendingWithdraw || 0) - amount, 0);

        providerWallet.cashInHand = newCashInHand;
        providerWallet.withdrawableBalance = newWithdrawableBalance;
        providerWallet.pendingWithdraw = newPendingWithdraw;

        providerWallet.transactions.push({
            type: "credit",
            amount,
            description: "Cash in hand received from customer",
            referenceId: checkout._id.toString(),
            method: "Cash",
            source: "checkout",
            status: "success",
            balanceAfterTransaction: newBalance,
            createdAt: new Date(),
        });

        providerWallet.balance = newBalance;
        providerWallet.totalCredits += amount;

        await providerWallet.save();

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
