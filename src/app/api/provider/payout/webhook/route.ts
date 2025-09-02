import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Wallet, { IWalletTransaction } from "@/models/Wallet";
import { connectToDatabase } from "@/utils/db";
import ProviderWallet from "@/models/ProviderWallet";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const body = await req.json();

    console.log("🔔 Cashfree Webhook received:", body);

    const transferId = body.transfer_id;
    const cashfreeStatus = body.status?.toUpperCase(); // SUCCESS | FAILED | RECEIVED
    const cfTransferId = body.cf_transfer_id;

    if (!transferId || !cashfreeStatus) {
      return NextResponse.json(
        { error: "Missing transfer_id or status" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1️⃣ Find wallet by transferId
   const providerWallet = await ProviderWallet.findOne({
      "transactions.referenceId": transferId,
    });

    if (!providerWallet) {
      return NextResponse.json(
        { error: "ProviderWallet not found for this transfer" },
        { status: 404, headers: corsHeaders }
      );
    }

    const txn = (providerWallet.transactions as IWalletTransaction[]).find(
      (t) => t.referenceId === transferId
    );

    if (!txn) {
      return NextResponse.json(
        { error: "Transaction not found in provider wallet" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 2️⃣ Update based on webhook status
    if (cashfreeStatus === "SUCCESS") {
      // ✅ Final debit only here
      providerWallet.balance -= txn.amount;
      providerWallet.totalDebits += txn.amount;
      providerWallet.pendingWithdraw = Math.max(
        0,
        providerWallet.pendingWithdraw - txn.amount
      ); // reduce pending withdraw
      providerWallet.alreadyWithdrawn += txn.amount; // track withdrawn amount

      txn.status = "success";
      txn.balanceAfterTransaction = providerWallet.balance;
    } else if (cashfreeStatus === "FAILED") {
      txn.status = "failed";
      // rollback pendingWithdraw if needed
      providerWallet.pendingWithdraw = Math.max(
        0,
        providerWallet.pendingWithdraw - txn.amount
      );
      providerWallet.withdrawableBalance += txn.amount; // put back into withdrawable
    } else if (cashfreeStatus === "RECEIVED") {
      txn.status = "pending"; // still processing
    }

    txn.leadId = cfTransferId || null;
    txn.description =
      body.status_description || txn.description || "Webhook update";

    await providerWallet.save();

    return NextResponse.json(
      { success: true, message: "Webhook processed" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("❌ Webhook error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
