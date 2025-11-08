import { NextRequest, NextResponse } from 'next/server';
import Wallet from '@/models/Wallet';
import AdminEarnings from '@/models/AdminEarnings';
import { connectToDatabase } from '@/utils/db';
import "@/models/User";
import UserPayout from '@/models/UserPayout';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

export async function PATCH(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const userId = url.pathname.split("/").pop();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { amount, transactionId, description, updaterName } = await req.json();

    if (amount === undefined || !transactionId) {
      return NextResponse.json(
        { success: false, message: 'Amount and transactionId are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch wallet
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return NextResponse.json(
        { success: false, message: 'Wallet not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Prepare transaction
    const transaction = {
      type: 'credit' as const,
      amount,
      description: description || 'Adjustment credit',
      referenceId: transactionId,
      method: 'Cash',
      source: 'adjustment',
      status: 'success',
      from: updaterName || 'Admin',
      commissionFrom: 'adjustment',
      leadId: '', // can be empty or optional
      createdAt: new Date(),
      balanceAfterTransaction: wallet.balance + amount,
    };

    // Update wallet: balance, totalCredits, transactions
    wallet.balance += amount;
    wallet.totalCredits += amount;
    wallet.pendingWithdraw +=amount;
    wallet.transactions.push(transaction);
    wallet.lastTransactionAt = new Date();

    await wallet.save();

     try {
      const { weekStart, weekEnd } = getWeekRange();

      await UserPayout.findOneAndUpdate(
        { userId, weekStart, weekEnd },
        { $inc: { pendingWithdraw: amount } },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error("Error updating weekly payout pending:", err);
    }

    // If userId matches admin earnings criteria
    if (userId === '444c44d4444be444d4444444') {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const adminEarnings = await AdminEarnings.findOne({ date: today });

      if (adminEarnings) {
        // adminEarnings.extraFees += amount; 
        adminEarnings.totalRevenue += amount;
        await adminEarnings.save();
      } else {
        await AdminEarnings.create({
          date: today,
          extraFees: 0,
          totalRevenue: amount,
          adminCommission: 0,
          providerEarnings: 0,
          franchiseEarnings: 0,
          refundsToUsers: 0,
          pendingPayouts: 0,
        });
      }
    }

    return NextResponse.json(
      { success: true, message: 'Wallet updated successfully', wallet },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(error);
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
