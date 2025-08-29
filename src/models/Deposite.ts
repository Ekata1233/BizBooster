import mongoose, { Schema, Document } from "mongoose";

/* ─────────────── Interface ─────────────────────────── */
export interface DepositeDocument extends Document {
  user: mongoose.Types.ObjectId;       // linked to User
  packagePrice: number;
  monthlyEarnings: number;
  lockInPeriod: number;
  deposite: number;
  packageActivateDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/* ─────────────── Schema ────────────────────────────── */
const depositeSchema = new Schema<DepositeDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    packagePrice: { type: Number, required: true },
    monthlyEarnings: { type: Number, required: true },
    lockInPeriod: { type: Number, required: true },
    deposite: { type: Number, required: true },
    packageActivateDate: {
      type: Date,
      default: null, // can also use Date.now if auto-activate
    },
  },
  { timestamps: true }
);

/* ─────────────── Model Export ───────────────────────── */
const Deposite =
  mongoose.models.Deposite ||
  mongoose.model<DepositeDocument>("Deposite", depositeSchema);

export default Deposite;
