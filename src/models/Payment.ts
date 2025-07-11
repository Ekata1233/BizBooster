import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  link_id: string; // cashfree payment link id
  payment_id?: string;
  amount: number;
  currency: string;
  status: string;
  customer_id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    link_id: { type: String, required: true, unique: true },
    payment_id: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, default: "PENDING" },

    customer_id: { type: String },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
