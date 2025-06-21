import mongoose, { Schema, Document, Types } from "mongoose";

/** Lead Subdocument Interface */
export interface IStatus {
  statusType: string;
  description?: string;
  zoomLink?: string;
  paymentLink?: string;
  paymentType?: "partial" | "full";
  document?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Lead Document Interface */
export interface ILead extends Document {
  checkout: mongoose.Types.ObjectId;
  serviceCustomer: mongoose.Types.ObjectId;
  serviceMan: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  amount: number;
  leads: IStatus[];
}

/** Lead Subschema */
const StatusSchema = new Schema<IStatus>(
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
  },
  { timestamps: true }
);

/** Lead Main Schema */
const LeadSchema = new Schema<ILead>(
  {
    checkout: {
      type: Schema.Types.ObjectId,
      ref: "Checkout",
      required: true,
    },
    serviceCustomer: {
      type: Schema.Types.ObjectId,
      ref: "ServiceCustomer",
      required: true,
    },
    serviceMan: {
      type: Schema.Types.ObjectId,
      ref: "ServiceMan",
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    leads: [StatusSchema], // Embedded status array
  },
  { timestamps: true }
);

/** Export the model */
export default mongoose.models.Lead ||
  mongoose.model<ILead>("Lead", LeadSchema);
