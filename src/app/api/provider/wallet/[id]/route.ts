// app/api/wallet/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import ProviderWallet from "@/models/ProviderWallet";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const providerId = url.pathname.split("/").pop();

    if (!providerId) {
      return NextResponse.json(
        { success: false, message: "Missing providerId" },
        { status: 400, headers: corsHeaders }
      );
    }

    const wallet = await ProviderWallet.findOne({ providerId });

    if (!wallet) {
      return NextResponse.json(
        { success: false, message: "Provider wallet not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: wallet },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching provider wallet:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const providerId = url.pathname.split("/").pop();
    const { amount, transactionId, description, updaterName } = await req.json();

    if (!providerId || amount === undefined) {
      return NextResponse.json(
        { error: "providerId and amount are required" },
        { status: 400 }
      );
    }

    // Check current wallet
    const wallet = await ProviderWallet.findOne({ providerId });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Check if there is enough adjustmentCash
    if (wallet.adjustmentCash < amount) {
      return NextResponse.json(
        { error: "Insufficient adjustment cash" },
        { status: 400 }
      );
    }

    const transaction = {
      type: 'debit',
      amount,
      description: description || 'Adjustment cash debit',
      referenceId: transactionId || undefined,
      method: 'Cash',
      source: 'adjustment',
      status: 'success',
      balanceAfterTransaction: wallet.balance,
      createdAt: new Date(),
    };

    // Subtract amount using $inc with negative value
    const updatedWallet = await ProviderWallet.findOneAndUpdate(
      { providerId },
      {
        $inc: { adjustmentCash: -amount, cashInHand: -amount },
        $push: { transactions: transaction },
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Adjustment cash subtracted successfully",
      wallet: updatedWallet,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}