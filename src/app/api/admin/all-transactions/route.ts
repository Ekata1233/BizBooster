// /api/admin/all-transactions.ts

import { NextResponse } from 'next/server';
import Wallet from '@/models/Wallet';
import ProviderWallet from '@/models/ProviderWallet';
import { connectToDatabase } from '@/utils/db';
import '@/models/User'
import '@/models/Provider'

// Type for a single transaction inside wallet.transactions
interface WalletTxn {
  type: 'credit' | 'debit';
  amount: number;
  description?: string;
  referenceId?: string;
  method: 'UPI' | 'Card' | 'BankTransfer' | 'Cash' | 'Wallet' | 'Other';
  source: 'checkout' | 'refund' | 'topup' | 'adjustment' | 'withdraw' | 'referral';
  status: 'success' | 'pending' | 'failed';
  balanceAfterTransaction?: number;
  createdAt: Date;
}

// Final format returned to admin frontend
interface AdminTransaction {
  transactionId: string;
  walletType: 'User' | 'Provider';
  to: string;
  date: Date;
  type: 'credit' | 'debit';
  source: string;
  method: string;
  status: 'success' | 'pending' | 'failed';
  credit: number;
  debit: number;
  balance: number | string;
}

export async function GET() {
  await connectToDatabase();

  const userWallets = await Wallet.find().populate('userId');
  const providerWallets = await ProviderWallet.find().populate('providerId');
  console.log("provider wallets : ", providerWallets)

  const userTxns: AdminTransaction[] = userWallets.flatMap(wallet =>
    wallet.transactions.map((txn: WalletTxn): AdminTransaction => ({
      transactionId: txn.referenceId || `U-${wallet.userId._id}-${txn.createdAt.getTime()}`,
      walletType: 'User',
      to: wallet.userId 
      ? `${wallet.userId.userId} - ${wallet.userId.fullName}` 
      : 'Unknown User',
      date: txn.createdAt,
      type: txn.type,
      source: txn.source,
      method: txn.method,
      status: txn.status,
      credit: txn.type === 'credit' ? txn.amount : 0,
      debit: txn.type === 'debit' ? txn.amount : 0,
      balance: txn.balanceAfterTransaction ?? '-',
    }))
  );

  const providerTxns: AdminTransaction[] = providerWallets.flatMap(wallet =>
    wallet.transactions.map((txn: WalletTxn): AdminTransaction => ({
      transactionId: txn.referenceId || `P-${wallet.providerId._id}-${txn.createdAt.getTime()}`,
      walletType: 'Provider',
      to:  wallet.providerId
      ? `${wallet.providerId.providerId} - ${wallet.providerId.fullName}`
      : 'Unknown Provider',
      date: txn.createdAt,
      type: txn.type,
      source: txn.source,
      method: txn.method,
      status: txn.status,
      credit: txn.type === 'credit' ? txn.amount : 0,
      debit: txn.type === 'debit' ? txn.amount : 0,
      balance: '-', // no balanceAfterTransaction stored in provider wallet
    }))
  );

  const allTransactions = [...userTxns, ...providerTxns].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return NextResponse.json(allTransactions);
}
