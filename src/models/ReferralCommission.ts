// models/ReferralCommission.ts
import mongoose, { Schema } from "mongoose";

const referralCommissionSchema = new Schema({
  fromLead: { type: Schema.Types.ObjectId, ref: "Lead" },
  receiver: { type: Schema.Types.ObjectId, ref: "Customer" }, // A or B
  amount: Number,
}, { timestamps: true });

export default mongoose.models.ReferralCommission || mongoose.model("ReferralCommission", referralCommissionSchema);
