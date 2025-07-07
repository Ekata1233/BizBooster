// app/api/wallet/withdraw/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { sendPayout } from "@/utils/cashfree";
import ProviderWallet, { IWalletTransaction } from "@/models/ProviderWallet";
import Provider from "@/models/Provider";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}


export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { providerId, amount } = body;

    console.log("details : ", body);

    if (!providerId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid provider ID or amount" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get wallet and provider
    const wallet = await ProviderWallet.findOne({ providerId });
    const provider = await Provider.findOne({ _id: providerId });

    console.log("provider details : ", provider)

    if (!wallet || wallet.balance < amount) {
      return NextResponse.json(
        { success: false, message: "Insufficient balance" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!provider || !wallet.beneficiaryId) {
      return NextResponse.json(
        { success: false, message: "Provider beneficiary details not found" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Send payout via Cashfree
    // const payoutResponse = await sendPayout(wallet.beneficiaryId, amount);

    // if (payoutResponse.status !== "SUCCESS") {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: "Cashfree payout failed",
    //       error: payoutResponse,
    //     },
    //     { status: 500, headers: corsHeaders }
    //   );
    // }

    // Add withdrawal transaction
    const transaction: IWalletTransaction = {
      type: "debit", // ✅ string literal matches the expected union type
      amount,
      description: "Provider withdrawal",
      method: "Wallet", // Make sure this is also allowed in IWalletTransaction
      source: "withdraw", // Same here
      status: "success",  // Same here
      balanceAfterTransaction: 0,
      createdAt: new Date(),
    };


    // Update wallet balance and log transaction
    wallet.balance -= amount;
    // wallet.cashInHand -= amount;
    wallet.alreadyWithdrawn += amount;
    wallet.withdrawableBalance = wallet.balance - wallet.pendingWithdraw;
    wallet.transactions.push(transaction);
    await wallet.save();

    return NextResponse.json(
      { success: true, message: "Withdrawal successful", wallet },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[WALLET_WITHDRAW_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
