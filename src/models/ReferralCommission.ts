// models/ReferralCommission.ts
import mongoose, { Document, Model, Schema } from "mongoose";
import { Types } from "mongoose";

// Interfaces for referenced models
export interface IReferralCommission extends Document {
  fromLead: Types.ObjectId;
  receiver: Types.ObjectId;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const referralCommissionSchema = new Schema<IReferralCommission>(
  {
    fromLead: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

// Exporting the model with type safety
const ReferralCommission: Model<IReferralCommission> =
  mongoose.models.ReferralCommission ||
  mongoose.model<IReferralCommission>("ReferralCommission", referralCommissionSchema);

export default ReferralCommission;
