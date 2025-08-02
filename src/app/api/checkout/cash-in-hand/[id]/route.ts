import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Checkout from "@/models/Checkout";
import ProviderWallet from "@/models/ProviderWallet";
import mongoose from "mongoose";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function PUT(req: NextRequest) {
    await connectToDatabase();

    try {
        const url = new URL(req.url);
        const id = url.pathname.split("/").pop();
        const body = await req.json(); // ✅ Get body
        const statusTypeFromClient = body.statusType || null;
        console.log("current status :", body);
        console.log(statusTypeFromClient);

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

        // ✅ 2. Update checkout fields based on statusType
        const amount = checkout.remainingAmount || 0;
        checkout.paymentStatus = "paid";
        checkout.cashInHand = true;
        checkout.cashInHandAmount = amount;

        if (statusTypeFromClient === "Lead completed") {
            checkout.orderStatus = "completed";
            checkout.isCompleted = true;
        }

        await checkout.save();

        // 3. Find provider's wallet
        const providerWallet = await ProviderWallet.findOne({ providerId: checkout.provider });
        if (!providerWallet) {
            return NextResponse.json(
                { success: false, message: "Provider wallet not found." },
                { status: 404, headers: corsHeaders }
            );
        }

        // 4. Calculate new balances
        console.log("previous balance of pending withdraw : ", providerWallet.pendingWithdraw);
        const newBalance = providerWallet.balance + amount;
        const newCashInHand = providerWallet.cashInHand + amount;

        console.log("ammount : ", amount);
        console.log("newCashInHand : ", newCashInHand);

        // 5. Add transaction
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

        // 6. Apply balance updates
        providerWallet.balance = newBalance;
        providerWallet.totalCredits += amount;
        providerWallet.cashInHand = newCashInHand;

        await providerWallet.save();

        return NextResponse.json(
            {
                success: true,
                message: "Checkout and provider wallet updated successfully.",
                data: {
                    checkout,
                    providerWallet,
                },
            },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error("Error updating cash in hand:", error);
        return NextResponse.json(
            { success: false, message: "Server error." },
            { status: 500, headers: corsHeaders }
        );
    }
}
