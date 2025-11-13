// models/Reward.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export type PackageType = "SGP" | "PGP" | null;

export interface IReward extends Document {
  name: string;
  photo?: string;
  description?: string;
  packageType?: PackageType;
  extraMonthlyEarn?: string;                // 🆕 Added
  extraMonthlyEarnDescription?: string;     // 🆕 Added
  createdAt?: Date;
  updatedAt?: Date;
}

const RewardSchema = new Schema<IReward>(
  {
    name: { type: String, required: true, trim: true },
    photo: { type: String, default: "" },
    description: { type: String, default: "" },
    packageType: {
      type: String,
      enum: ["SGP", "PGP"],
      default: null,
    },
    extraMonthlyEarn: { type: String, default: "" },                // 🆕 Added
    extraMonthlyEarnDescription: { type: String, default: "" },     // 🆕 Added
  },
  { timestamps: true }
);

const Reward: Model<IReward> =
  (mongoose.models.Reward as Model<IReward>) ||
  mongoose.model<IReward>("Reward", RewardSchema);

export default Reward;
