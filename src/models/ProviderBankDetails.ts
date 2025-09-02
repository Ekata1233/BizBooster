import mongoose, { Schema, Document } from "mongoose";

// Interface
export interface IProviderBankDetails extends Document {
  providerId: mongoose.Types.ObjectId;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  branchName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const ProviderBankDetailsSchema = new Schema<IProviderBankDetails>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "ProviderId",
      required: [true, "Provider ID is required"],
      unique: true, 
    },
    accountNumber: {
      type: String,
      required: [true, "Account number is required"],
      match: [/^\d{9,18}$/, "Invalid account number format"], // typical Indian account number (9–18 digits)
    },
    ifsc: {
      type: String,
      required: [true, "IFSC code is required"],
      uppercase: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"], // RBI standard format
    },
    bankName: {
      type: String,
      required: [true, "Bank name is required"],
      maxlength: [100, "Bank name must not exceed 100 characters"],
    },
    branchName: {
      type: String,
      maxlength: [100, "Branch name must not exceed 100 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Model export
const ProviderBankDetails =
  mongoose.models.ProviderBankDetails ||
  mongoose.model<IProviderBankDetails>("ProviderBankDetails", ProviderBankDetailsSchema);

export default ProviderBankDetails;
