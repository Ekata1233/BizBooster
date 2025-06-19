import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILead extends Document {
  statusType: string;
  description?: string;
  zoomLink?: string;
  paymentLink?: string;
  paymentType?: "partial" | "full";
  document?: string;
  checkout: Types.ObjectId;
}

const LeadSchema = new Schema<ILead>(
  {
    statusType: {
      type: String,
      required: true,
      enum: [
        "Lead request",
        "Initial contact",
        "Need understand requirement",
        "Payment request (partial/full)",
        "Payment verified",
        "Lead accepted",
        "Lead requested documents",
        "Lead started",
        "Lead ongoing",
        "Lead completed",
        "Lead cancel",
        "Refund",
      ],
    },
    description: String,
    zoomLink: String,
    paymentLink: String,
    paymentType: {
      type: String,
      enum: ["partial", "full"],
    },
    document: String,
    checkout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checkout",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);
