// import { NextRequest, NextResponse } from "next/server";
// import { connectToDatabase } from "@/utils/db";
// import Checkout from "@/models/Checkout";
// import ProviderWallet from "@/models/ProviderWallet";
// import mongoose from "mongoose";

// const corsHeaders = {
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//     return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function PUT(req: NextRequest) {
//     await connectToDatabase();

//     try {
//         const url = new URL(req.url);
//         const id = url.pathname.split("/").pop();
//         const body = await req.json(); // ✅ Get body
//         const statusTypeFromClient = body.statusType || null;
//         console.log("current status :", body);
//         console.log(statusTypeFromClient);

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

//         // ✅ 2. Update checkout fields based on statusType
//         const amount = checkout.remainingAmount || 0;
//         checkout.paymentStatus = "paid";
//         checkout.cashInHand = true;
//         checkout.cashInHandAmount = amount;

//         if (statusTypeFromClient === "Lead completed") {
//             checkout.orderStatus = "completed";
//             checkout.isCompleted = true;
//         }

//         await checkout.save();

//         // 3. Find provider's wallet
//         const providerWallet = await ProviderWallet.findOne({ providerId: checkout.provider });
//         if (!providerWallet) {
//             return NextResponse.json(
//                 { success: false, message: "Provider wallet not found." },
//                 { status: 404, headers: corsHeaders }
//             );
//         }

//         // 4. Calculate new balances
//         console.log("previous balance of pending withdraw : ", providerWallet.pendingWithdraw);
//         const newBalance = providerWallet.balance + amount;
//         const newCashInHand = providerWallet.cashInHand + amount;

//         console.log("ammount : ", amount);
//         console.log("newCashInHand : ", newCashInHand);

//         // 5. Add transaction
//         providerWallet.transactions.push({
//             type: "credit",
//             amount,
//             description: "Cash in hand received from customer",
//             referenceId: checkout._id.toString(),
//             method: "Cash",
//             source: "checkout",
//             status: "success",
//             balanceAfterTransaction: newBalance,
//             createdAt: new Date(),
//         });

//         // 6. Apply balance updates
//         providerWallet.balance = newBalance;
//         providerWallet.totalCredits += amount;
//         providerWallet.cashInHand = newCashInHand;

//         await providerWallet.save();

//         return NextResponse.json(
//             {
//                 success: true,
//                 message: "Checkout and provider wallet updated successfully.",
//                 data: {
//                     checkout,
//                     providerWallet,
//                 },
//             },
//             { status: 200, headers: corsHeaders }
//         );
//     } catch (error) {
//         console.error("Error updating cash in hand:", error);
//         return NextResponse.json(
//             { success: false, message: "Server error." },
//             { status: 500, headers: corsHeaders }
//         );
//     }
// }


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
    const leadUpdates = existingLead.leads.map((l: LeadEntry, idx: number) => ({
        ...l,
        index: idx,
        statusType: (l.statusType || "").toLowerCase(),
        createdAt: new Date(l.createdAt ?? 0),
    }));

    const paymentRequests = leadUpdates
        .filter((l: LeadEntry) => l.statusType === "payment request (partial/full)")
        .sort((a:LeadEntry, b:LeadEntry) =>  {
                    const aTime = new Date(a.createdAt ?? 0).getTime();
                    const bTime = new Date(b.createdAt ?? 0).getTime();
                    return bTime - aTime;
                });

    const latestRequest = paymentRequests[0];

    const latestVerified = leadUpdates
        .filter((l: LeadEntry) => l.statusType === "payment verified")
        .sort((a:LeadEntry, b:LeadEntry) => {
                    const aTime = new Date(a.createdAt ?? 0).getTime();
                    const bTime = new Date(b.createdAt ?? 0).getTime();
                    return bTime - aTime;
                })[0];

    const isVerifiedForRequest =
        latestVerified &&
        latestRequest &&
        latestVerified.createdAt > latestRequest.createdAt;

    if (latestRequest && !isVerifiedForRequest) {
        // 1. Update the description
        existingLead.leads[latestRequest.index] = {
            ...existingLead.leads[latestRequest.index],
            description: "Customer made payment via cash in hand",
        };

        // 2. Add "Payment verified"
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
        console.log("✅ Updated payment request & added payment verified.");
    } else {
        console.log("⚠️ Already verified or no valid payment request found.");
    }
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
