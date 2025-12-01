import { Types } from "mongoose";

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
  royaltyPercent: string; // e.g., "8% Monthly"
  grossMargin: string; // e.g., "40-45%"
  radiusArea: string; // e.g., "2-3 km"
}

// ---------------------- Main Franchise Interface ----------------------
export interface FranchiseDetails {
  serviceId : Types.ObjectId,
  investment: FranchiseInvestmentRange;
  model: FranchiseModelDetails;
}
