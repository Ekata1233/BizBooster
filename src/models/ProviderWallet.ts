import mongoose, { Schema, Document } from "mongoose";

export interface IWalletTransaction {
  type: 'credit' | 'debit';
  amount: number;
  description?: string;
  referenceId?: string;
  method?: string;
  source?: string;
  status?: 'success' | 'failed' | 'pending';
  balanceAfterTransaction: number;
  createdAt: Date;
}

export interface IProviderWallet extends Document {
  providerId: mongoose.Types.ObjectId;
  balance: number;
  beneficiaryId: string;
  bankAccount: string;
  upiId?: string;
  transactions: IWalletTransaction[];
  receivableBalance: number;
  withdrawableBalance: number;
  pendingWithdraw: number;
  alreadyWithdrawn: number;
  totalEarning: number;
  totalCredits: number;
  totalDebits: number;
  cashInHand: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<IWalletTransaction>(
  {
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, maxlength: 255 },
    referenceId: { type: String, maxlength: 100 },
    method: {
      type: String,
      enum: ['UPI', 'Card', 'BankTransfer', 'Cash', 'Wallet', 'Other'],
      default: 'Wallet',
    },
    source: {
      type: String,
      enum: ['checkout', 'refund', 'topup', 'adjustment', 'withdraw'],
      default: 'topup',
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success',
    },
    balanceAfterTransaction: {
      type: Number,
      // required: true, 
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ProviderWalletSchema = new Schema<IProviderWallet>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    beneficiaryId: {
      type: String,
      required: true,
      maxlength: 100,
    },
    bankAccount: {
      type: String,
      required: true,
      maxlength: 100,
    },
    upiId: {
      type: String,
      match: [/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID format'],
      maxlength: 50,
    },
    transactions: {
      type: [TransactionSchema],
      default: [],
    },
    receivableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    withdrawableBalance: {
      type: Number,
      default: 0,
    },
    pendingWithdraw: {
      type: Number,
      default: 0,
    },
    alreadyWithdrawn: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarning: {
      type: Number,
      default: 0,
    },
    totalCredits: {
      type: Number,
      default: 0,
      min: [0, 'Total credits cannot be negative'],
    },
    totalDebits: {
      type: Number,
      default: 0,
      min: [0, 'Total debits cannot be negative'],
    },
    cashInHand: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const ProviderWallet = mongoose.models.ProviderWallet || mongoose.model<IProviderWallet>('ProviderWallet', ProviderWalletSchema);

export default ProviderWallet;
