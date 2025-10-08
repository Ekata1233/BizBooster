
// import { NextRequest, NextResponse } from "next/server";
// import { connectToDatabase } from "@/utils/db";
// import Checkout from "@/models/Checkout";
// import ProviderWallet from "@/models/ProviderWallet";
// import Lead from "@/models/Lead"; // ✅ Ensure Lead model is imported
// import mongoose from "mongoose";

// const corsHeaders = {
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//     return NextResponse.json({}, { headers: corsHeaders });
// }
// type LeadEntry = {
//     statusType?: string;
//     description?: string;
//     createdAt?: string | number | Date;
// };

// const round2 = (num: number) => Number(num.toFixed(2));
// export async function PUT(req: NextRequest) {
//     await connectToDatabase();

//     try {
//         const url = new URL(req.url);
//         const id = url.pathname.split("/").pop();
//         const body = await req.json();
//         const statusTypeFromClient = body.statusType || null;
//         const paymentType = body.paymentKind || null; // new
//         const bodyAmount = body.amount ?? null;

//         console.log("body of the cash in hand : ", body)

//         const fetchedAmount =
//             paymentType === "partial"
//                 ? round2(bodyAmount ?? 0) / 2
//                 : paymentType === "full" || paymentType === "remaining"
//                     ? round2(bodyAmount ?? 0)
//                     : 0;

//         console.log("Fetched Amount:", fetchedAmount);

//         if (!id) {
//             return NextResponse.json(
//                 { success: false, message: "Missing checkout ID." },
//                 { status: 400, headers: corsHeaders }
//             );
//         }

//         // 1. Find Checkout
//         const checkout = await Checkout.findById(id);
//         if (!checkout) {
//             return NextResponse.json(
//                 { success: false, message: "Checkout not found." },
//                 { status: 404, headers: corsHeaders }
//             );
//         }

//         const total =
//             round2(checkout.grandTotal && checkout.grandTotal > 0
//                 ? Number(checkout.grandTotal)
//                 : Number(checkout.totalAmount ?? 0));
//         checkout.cashInHand = true;
//         checkout.cashInHandAmount = round2((checkout.cashInHandAmount || 0) + fetchedAmount);
//         checkout.paidAmount = round2((checkout.paidAmount || 0) + fetchedAmount);
//         checkout.remainingAmount = round2(Math.max(total - checkout.paidAmount, 0));
//         const isFullPayment = checkout.paidAmount >= total;
//         checkout.paymentStatus = isFullPayment ? "paid" : "pending";
//         checkout.isPartialPayment = !isFullPayment;

//         if (statusTypeFromClient === "Lead completed") {
//             checkout.orderStatus = "completed";
//             checkout.isCompleted = true;
//         }

//         await checkout.save();

//         // 3. Update Lead status if cash-in-hand payment is latest
//         const existingLead = await Lead.findOne({ checkout: id });

//         if (existingLead) {

//             type LeadWithIndex = { lead: LeadEntry; idx: number };

//             const latestPaymentRequest = existingLead.leads
//                 .map((l: LeadEntry, idx: number) => ({ lead: l, idx }))
//                 .filter(
//                     (entry: LeadWithIndex) =>
//                         entry.lead.statusType?.toLowerCase().trim() === "payment request (partial/full)"
//                 )
//                 .sort((a: LeadWithIndex, b: LeadWithIndex) => {
//                     const aTime = new Date(a.lead.createdAt ?? 0).getTime();
//                     const bTime = new Date(b.lead.createdAt ?? 0).getTime();
//                     return bTime - aTime;
//                 })[0];

//             if (latestPaymentRequest && typeof latestPaymentRequest.idx === "number") {
//                 const idx = latestPaymentRequest.idx;

//                 // ✅ Update description and blank paymentLink
//                 existingLead.leads[idx].description = "Customer made payment to provider via cash in hand";
//                 existingLead.leads[idx].paymentLink = "";
//             }

//             // ✅ Add "Payment verified" entry
//             const now = new Date();
//             const description =
//                 paymentType === "partial"
//                     ? `Payment verified (Partial - ${fetchedAmount}) via Customer - Cash in hand`
//                     : `Payment verified (Full - ${fetchedAmount}) via Customer - Cash in hand`;


//             existingLead.leads.push({
//                 statusType: "Payment verified",
//                 description,
//                 createdAt: now,
//             });

//             await existingLead.save();
//         }




//         // 4. Update provider wallet
//         const providerWallet = await ProviderWallet.findOne({ providerId: checkout.provider });
//         if (!providerWallet) {
//             return NextResponse.json(
//                 { success: false, message: "Provider wallet not found." },
//                 { status: 404, headers: corsHeaders }
//             );
//         }

//         const prevBalance = round2(providerWallet.balance || 0);
//         const newBalance = round2(prevBalance - fetchedAmount);
//         const newCashInHand = round2((providerWallet.cashInHand || 0) + fetchedAmount);
//         const newWithdrawableBalance = round2(Math.max((providerWallet.withdrawableBalance || 0) - fetchedAmount, 0));
//         const newPendingWithdraw = round2(Math.max((providerWallet.pendingWithdraw || 0) - fetchedAmount, 0));

//         providerWallet.cashInHand = newCashInHand;
//         providerWallet.withdrawableBalance = newWithdrawableBalance;
//         providerWallet.pendingWithdraw = newPendingWithdraw;

//         providerWallet.transactions.push({
//             type: "debit",
//             amount: round2(fetchedAmount),
//             description: "Cash in hand received from customer",
//             referenceId: checkout._id.toString(),
//             method: "Cash",
//             source: "checkout",
//             status: "success",
//             balanceAfterTransaction: newBalance,
//             createdAt: new Date(),
//             leadId: checkout.bookingId,
//         });

//         providerWallet.balance = newBalance;
//         // providerWallet.totalCredits += fetchedAmount;
//         providerWallet.totalEarning = round2((providerWallet.totalEarning || 0) - fetchedAmount);
//         providerWallet.totalCredits = round2((providerWallet.totalCredits || 0) - fetchedAmount);

//         await providerWallet.save();

//         return NextResponse.json(
//             {
//                 success: true,
//                 message: "Checkout, provider wallet, and lead status updated successfully.",
//                 data: {
//                     checkout,
//                     providerWallet,
//                 },
//             },
//             { status: 200, headers: corsHeaders }
//         );
//     } catch (error) {
//         console.error("❌ Error in PUT handler:", error);
//         return NextResponse.json(
//             { success: false, message: "Server error." },
//             { status: 500, headers: corsHeaders }
//         );
//     }
// }



//IF BALANCE IS 0 AND CASH IN HAND >0 THEN : SOLUTION : 

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

const round2 = (num: number) => Number(num.toFixed(2));
export async function PUT(req: NextRequest) {
    await connectToDatabase();

    try {
        const url = new URL(req.url);
        const id = url.pathname.split("/").pop();
        const body = await req.json();
        const statusTypeFromClient = body.statusType || null;
        const paymentType = body.paymentKind || null; // new
        const bodyAmount = body.amount ?? null;

        console.log("body of the cash in hand : ", body)

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

        // 1. Find Checkout
        const checkout = await Checkout.findById(id);
        if (!checkout) {
            return NextResponse.json(
                { success: false, message: "Checkout not found." },
                { status: 404, headers: corsHeaders }
            );
        }

        const total =
            round2(checkout.grandTotal && checkout.grandTotal > 0
                ? Number(checkout.grandTotal)
                : Number(checkout.totalAmount ?? 0));
        checkout.cashInHand = true;
        checkout.cashInHandAmount = round2((checkout.cashInHandAmount || 0) + fetchedAmount);
        checkout.paidAmount = round2((checkout.paidAmount || 0) + fetchedAmount);
        checkout.remainingAmount = round2(Math.max(total - checkout.paidAmount, 0));
        const isFullPayment = checkout.paidAmount >= total;
        checkout.paymentStatus = isFullPayment ? "paid" : "pending";
        checkout.isPartialPayment = !isFullPayment;

        if (statusTypeFromClient === "Lead completed") {
            checkout.orderStatus = "completed";
            checkout.isCompleted = true;
        }

        await checkout.save();

        // 3. Update Lead status if cash-in-hand payment is latest
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

                // ✅ Update description and blank paymentLink
                existingLead.leads[idx].description = "Customer made payment to provider via cash in hand";
                existingLead.leads[idx].paymentLink = "";
            }

            // ✅ Add "Payment verified" entry
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




        // 4. Update provider wallet
        const providerWallet = await ProviderWallet.findOne({ providerId: checkout.provider });
        if (!providerWallet) {
            return NextResponse.json(
                { success: false, message: "Provider wallet not found." },
                { status: 404, headers: corsHeaders }
            );
        }

        const prevBalance = round2(providerWallet.balance || 0);
        let remainingCash = 0;
        let newBalance = prevBalance - fetchedAmount;

        if (newBalance < 0) {
            remainingCash = Math.abs(newBalance);
            newBalance = 0;
        }
        providerWallet.adjustmentCash = round2((providerWallet.adjustmentCash || 0) + remainingCash);

        const newCashInHand = round2((providerWallet.cashInHand || 0) + fetchedAmount);
        const newWithdrawableBalance = round2(Math.max((providerWallet.withdrawableBalance || 0) - fetchedAmount, 0));
        const newPendingWithdraw = round2(Math.max((providerWallet.pendingWithdraw || 0) - fetchedAmount, 0));

        providerWallet.cashInHand = newCashInHand;
        providerWallet.withdrawableBalance = newWithdrawableBalance;
        providerWallet.pendingWithdraw = newPendingWithdraw;
        providerWallet.balance = newBalance;

        providerWallet.transactions.push({
            type: "debit",
            amount: round2(fetchedAmount),
            description: remainingCash > 0
                ? `Cash in hand received from customer (adjusted ₹${remainingCash} due to insufficient balance)`
                : "Cash in hand received from customer",
            referenceId: checkout._id.toString(),
            method: "Cash",
            source: "checkout",
            status: "success",
            balanceAfterTransaction: newBalance,
            createdAt: new Date(),
            leadId: checkout.bookingId,
        });

        // providerWallet.balance = newBalance;
        // providerWallet.totalCredits += fetchedAmount;
        // providerWallet.totalEarning = round2((providerWallet.totalEarning || 0) - fetchedAmount);
        // providerWallet.totalCredits = round2((providerWallet.totalCredits || 0) - fetchedAmount);

        const deductedFromBalance = fetchedAmount - remainingCash;
        providerWallet.totalEarning = round2((providerWallet.totalEarning || 0) - deductedFromBalance);
        providerWallet.totalCredits = round2((providerWallet.totalCredits || 0) - deductedFromBalance);


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
