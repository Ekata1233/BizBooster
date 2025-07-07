import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminEarnings extends Document {
  date: string; // format: YYYY-MM-DD
  totalRevenue: number;
  adminCommission: number;
  providerEarnings: number;
  franchiseEarnings: number;
  refundsToUsers: number;
  extraFees: number;
  pendingPayouts: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdminEarningsSchema = new Schema<IAdminEarnings>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    adminCommission: {
      type: Number,
      default: 0,
    },
    providerEarnings: {
      type: Number,
      default: 0,
    },
    franchiseEarnings: {
      type: Number,
      default: 0,
    },
    refundsToUsers: {
      type: Number,
      default: 0,
    },
    extraFees: {
      type: Number,
      default: 0,
    },
    pendingPayouts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const AdminEarnings = mongoose.models.AdminEarnings || mongoose.model<IAdminEarnings>('AdminEarnings', AdminEarningsSchema);
export default AdminEarnings;
