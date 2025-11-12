// models/ClaimNow.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IClaimNow extends Document {
  user: mongoose.Schema.Types.ObjectId;
  reward: mongoose.Schema.Types.ObjectId; // ✅ new reward ref
  rewardTitle: string | null;
  rewardPhoto: string;
  rewardDescription: string;
  isAdminApproved: boolean;
  disclaimer: string;
  isClaimSettled: boolean;
  isClaimRequest: boolean;
  isClaimAccepted: boolean | null;
}

const claimNowSchema = new Schema<IClaimNow>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reward", // ✅ reference to Reward
      required: true,
    },
    rewardTitle: { type: String, default: null },
    rewardPhoto: { type: String, default: "" },
    rewardDescription: { type: String, default: "" },
    isAdminApproved: { type: Boolean, default: false },
    disclaimer: { type: String, default: "" },
    isClaimSettled: { type: Boolean, default: false },
    isClaimRequest: { type: Boolean, default: false },
    isClaimAccepted: { type: Boolean, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.ClaimNow ||
  mongoose.model<IClaimNow>("ClaimNow", claimNowSchema);
