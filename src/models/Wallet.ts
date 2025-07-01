import mongoose, { Schema, Document } from "mongoose";

// Wallet Interface
export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  transactions: IWalletTransaction[];
  totalCredits: number;
  totalDebits: number;
  lastTransactionAt?: Date;
  linkedBankAccount?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Subdocument Interface
export interface IWalletTransaction {
  type: 'credit' | 'debit';
  amount: number;
  description?: string;
  referenceId?: string;
  method?: string;
  source?: string;
  status?: 'success' | 'failed' | 'pending';
  createdAt: Date;
}

const TransactionSchema = new Schema<IWalletTransaction>(
  {
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be a positive number'],
    },
    description: {
      type: String,
      maxlength: [255, 'Description must not exceed 255 characters'],
    },
    referenceId: {
      type: String,
      maxlength: [100, 'Reference ID must not exceed 100 characters'],
    },
    method: {
      type: String,
      enum: {
        values: ['UPI', 'Card', 'BankTransfer', 'Cash', 'Wallet', 'Other'],
        message: 'Invalid method',
      },
      default: 'Wallet',
    },
    source: {
      type: String,
      enum: ['checkout', 'refund', 'topup', 'adjustment','referral'],
      default: 'checkout',
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    transactions: {
      type: [TransactionSchema],
      default: [],
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
    lastTransactionAt: {
      type: Date,
    },
    linkedBankAccount: {
      type: String,
      match: [/^[\w.-]+@[\w.-]+$/, 'Invalid bank account or UPI ID format'],
      maxlength: [50, 'Bank account/UPI ID must not exceed 50 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
// export default Wallet;


const Wallet = mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);
export default Wallet;
