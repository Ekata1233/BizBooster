import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  order_id: string;
  payment_session_id: string;
  amount: number;
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    order_id: { type: String, required: true, unique: true },
    payment_session_id: { type: String, required: true },
    amount: { type: Number, required: true },
    customer_id: { type: String, required: true },
    name: String,
    email: String,
    phone: String,
    status: { type: String, default: "CREATED" },
  },
  { timestamps: true }
);

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
