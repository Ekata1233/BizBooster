
import mongoose, { Schema, model, Types } from "mongoose";
// ---------------------- Investment Details ----------------------
export interface FranchiseInvestmentRange {
  franchiseSize: 'Small' | 'Medium' | 'Large';
  franchiseType: string;
  city: string;
  franchiseFee: number; // ₹
  businessLicenses: number; // ₹
  insurance: number; // ₹
  legalAndAccountingFee: number; // ₹
  inventoryFee: number; // ₹
  officeSetup: number; // ₹
  initialStartupEquipmentAndMarketing: number; // ₹
  staffAndManagementTrainingExpense: number; // ₹
  otherExpense: number; // ₹
  totalInvestment: number; // ₹
  gstIncluded?: boolean; 
  gst: number;
  tokenAmount?: number;
}

// ---------------------- Franchise Model Details ----------------------
export interface FranchiseModelDetails {
  franchiseSize: 'Small' | 'Medium' | 'Large';
  areaRequired: string; // e.g., "₹500-1000 sq.ft."
  marketing?: string; // e.g., "360 Marketing"
  returnOfInvestment?: string; // e.g., "25-30%"
   manPower:number;
  staffManagement: string,

  royaltyPercent: string; // e.g., "8% Monthly"
  grossMargin: string; // e.g., "40-45%"
  radiusArea: string; // e.g., "2-3 km"
}

// ---------------------- Main Franchise Interface ----------------------
export interface ExtraServiceDetails {
  serviceId: Types.ObjectId;
  investment: FranchiseInvestmentRange[]; // <-- array
  model: FranchiseModelDetails[]; // <-- array
}


const FranchiseInvestmentRangeSchema = new Schema({
  franchiseSize: { type: String, enum: ['Small', 'Medium', 'Large'], required: true },
  franchiseType: { type: String, required: true },
  city: { type: String, required: true },
  franchiseFee: { type: Number, required: true },
  businessLicenses: { type: Number, required: true },
  insurance: { type: Number, required: true },
  legalAndAccountingFee: { type: Number, required: true },
  inventoryFee: { type: Number, required: true },
  officeSetup: { type: Number, required: true },
  initialStartupEquipmentAndMarketing: { type: Number, required: true },
  staffAndManagementTrainingExpense: { type: Number, required: true },
  otherExpense: { type: Number, required: true },
  totalInvestment: { type: Number, required: true },
  gstIncluded: { type: Boolean, default: false },
  gst: { type: Number, required: true },
  tokenAmount: { type: Number },
});

const FranchiseModelDetailsSchema = new Schema({
  franchiseSize: { type: String, enum: ['Small', 'Medium', 'Large'], required: true },
  areaRequired: { type: String, required: true },
  marketing: { type: String },
  returnOfInvestment: { type: String },
  manPower: { type: Number, required: true },
  staffManagement: { type: String, required: true },

  royaltyPercent: { type: String, required: true },
  grossMargin: { type: String, required: true },
  radiusArea: { type: String, required: true },
});

const FranchiseSchema = new Schema({
  serviceId: { type: Types.ObjectId, required: true, ref: "Service" }, // reference to your service
 investment: {
    type: [FranchiseInvestmentRangeSchema], 
    required: true
  },
  model: {
    type: [FranchiseModelDetailsSchema],
    required: true
  }
}, { timestamps: true });

const Franchise = mongoose.models.Franchise || model("Franchise", FranchiseSchema);

export default Franchise;