import mongoose, { Schema, Document } from "mongoose";

export interface IUserPayout extends Document {
  userId: mongoose.Types.ObjectId;
  weekStart: Date;
  weekEnd: Date;
  pendingWithdraw: number;
  withdrawnAmount: number;
  status: "pending" | "paid";
  processedAt?: Date;
  referenceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserPayoutSchema = new Schema<IUserPayout>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    pendingWithdraw: {
      type: Number,
      default: 0,
      min: [0, "Pending amount cannot be negative"],
    },
    withdrawnAmount: {
      type: Number,
      default: 0,
      min: [0, "Withdrawn amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    processedAt: { type: Date },
    referenceId: { type: String },
  },
  { timestamps: true }
);

const UserPayout =
  mongoose.models.UserPayout || mongoose.model<IUserPayout>("UserPayout", UserPayoutSchema);

export default UserPayout;
