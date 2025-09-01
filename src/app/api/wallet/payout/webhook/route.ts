import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Wallet, { IWalletTransaction } from "@/models/Wallet";
import { connectToDatabase } from "@/utils/db";

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
    const wallet = await Wallet.findOne({
      "transactions.referenceId": transferId,
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found for this transfer" },
        { status: 404, headers: corsHeaders }
      );
    }

    const txn = (wallet.transactions as IWalletTransaction[]).find(
      (t) => t.referenceId === transferId
    );

    if (!txn) {
      return NextResponse.json(
        { error: "Transaction not found in wallet" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 2️⃣ Update based on webhook status
    if (cashfreeStatus === "SUCCESS") {
      // ✅ Final debit only here
      wallet.balance -= txn.amount;
      wallet.totalDebits += txn.amount;
      wallet.lastTransactionAt = new Date();

      txn.status = "success";
      txn.balanceAfterTransaction = wallet.balance;
    } else if (cashfreeStatus === "FAILED") {
      txn.status = "failed";
    } else if (cashfreeStatus === "RECEIVED") {
      txn.status = "pending"; // still processing
    }

    txn.leadId = cfTransferId || null;
    txn.description =
      body.status_description || txn.description || "Webhook update";

    await wallet.save();

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
