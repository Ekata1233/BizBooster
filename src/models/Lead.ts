import mongoose, { Schema, Document, Types } from "mongoose";

interface IExtraService {
  serviceName: string;
  price: number;
  discount: number;
  total: number;
  isLeadApproved?: boolean;
}
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
  newAmount?: number;
  newDiscountAmount?: number;
  afterDicountAmount?:number;
  extraService?: IExtraService[];
  leads: IStatus[];
  isAdminApproved?: boolean;
}

/** ExtraService Subschema */
const ExtraServiceSchema = new Schema<IExtraService>(
  {
    serviceName: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    isLeadApproved: {
      type: Boolean,
      default: null,
    },
  },
  { _id: false } // Disable _id for subdocuments if not needed
);
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
    newAmount: {
      type: Number,
    },
    newDiscountAmount:{
      type: Number,
    },
    afterDicountAmount: {
      type: Number,
    },
    extraService: [ExtraServiceSchema],
    leads: [StatusSchema], // Embedded status array
    isAdminApproved: {
      type: Boolean,
      default: null,
    },
  },
  { timestamps: true }
);

/** Export the model */
export default mongoose.models.Lead ||
  mongoose.model<ILead>("Lead", LeadSchema);
