import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  order_id: string;               // Cashfree order ID
  payment_id?: string;            // Cashfree payment ID (cf_payment_id)
  amount: number;
  currency: string;
  status: string;                 // Payment status like SUCCESS / FAILED
  name?: string;
  email?: string;
  phone?: string;
  payment_time?: Date;
  bank_reference?: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    order_id: { type: String, required: true, unique: true },
    payment_id: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, default: "PENDING" },

    name: { type: String },
    email: { type: String },
    phone: { type: String },

    payment_time: { type: Date },
    bank_reference: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
