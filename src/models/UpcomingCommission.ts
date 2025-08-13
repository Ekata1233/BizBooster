import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICommissionPreview extends Document {
  leadId: Types.ObjectId;
  checkoutId: Types.ObjectId;
  share_1: number;
  share_2: number;
  share_3: number;
  admin_commission: number;
  provider_share: number;
  extra_share_1?: number;
  extra_share_2?: number;
  extra_share_3?: number;
  extra_admin_commission?: number;
  extra_provider_share?: number;
  status: "pending" | "distributed";
  createdAt: Date;
  updatedAt: Date;
}

const CommissionPreviewSchema = new Schema<ICommissionPreview>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    checkoutId: { type: Schema.Types.ObjectId, ref: "Checkout", required: true },
    share_1: { type: Number, default: 0 },
    share_2: { type: Number, default: 0 },
    share_3: { type: Number, default: 0 },
    admin_commission: { type: Number, default: 0 },
    provider_share: { type: Number, default: 0 },
    extra_share_1: { type: Number, default: 0 },
    extra_share_2: { type: Number, default: 0 },
    extra_share_3: { type: Number, default: 0 },
    extra_admin_commission: { type: Number, default: 0 },
    extra_provider_share: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "distributed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.CommissionPreview ||
  mongoose.model<ICommissionPreview>("CommissionPreview", CommissionPreviewSchema);
