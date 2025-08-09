import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUpcomingCommission extends Document {
  checkoutId: Types.ObjectId;
  bookingId: string;
  leadId: Types.ObjectId;
  share_3: Types.ObjectId;
  share_2?: Types.ObjectId;
  share_1?: Types.ObjectId;
  providerId: Types.ObjectId;
  adminId: Types.ObjectId;
  providerAmount: number;
  adminAmount: number;
  share_3Amount: number;
  share_2Amount: number;
  share_1Amount: number;
  extraProviderAmount: number;
  extraAdminAmount: number;
  extra_share_3Amount: number;
  extra_share_2Amount: number;
  extra_share_1Amount: number;
  createdAt: Date;
}

const UpcomingCommissionSchema: Schema<IUpcomingCommission> = new Schema({
  checkoutId: { type: Schema.Types.ObjectId, ref: "Checkout", required: true },
  bookingId: { type: String },
  leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
  share_3: { type: Schema.Types.ObjectId, ref: "User", required: true },
  share_2: { type: Schema.Types.ObjectId, ref: "User" },
  share_1: { type: Schema.Types.ObjectId, ref: "User" },
  providerId: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
  adminId: { type: Schema.Types.ObjectId, required: true },
  providerAmount: { type: Number, default: 0 },
  adminAmount: { type: Number, default: 0 },
  share_3Amount: { type: Number, default: 0 },
  share_2Amount: { type: Number, default: 0 },
  share_1Amount: { type: Number, default: 0 },
  extraProviderAmount: { type: Number, default: 0 },
  extraAdminAmount: { type: Number, default: 0 },
  extra_share_3Amount: { type: Number, default: 0 },
  extra_share_2Amount: { type: Number, default: 0 },
  extra_share_1Amount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.UpcomingCommission ||
  mongoose.model<IUpcomingCommission>("UpcomingCommission", UpcomingCommissionSchema);
