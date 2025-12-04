
import mongoose, { Schema, model, Types } from "mongoose";
// ---------------------- Investment Details ----------------------
export interface FranchiseInvestmentRange {
  franchiseSize: string;
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
  franchiseSize: string;
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
  franchiseSize: { type: String,  },
  franchiseType: { type: String,  },
  city: { type: String,  },
  franchiseFee: { type: Number,  },
  businessLicenses: { type: Number,  },
  insurance: { type: Number,  },
  legalAndAccountingFee: { type: Number,  },
  inventoryFee: { type: Number,  },
  officeSetup: { type: Number,  },
  initialStartupEquipmentAndMarketing: { type: Number,  },
  staffAndManagementTrainingExpense: { type: Number,  },
  otherExpense: { type: Number,  },
  totalInvestment: { type: Number,  },
  gstIncluded: { type: Boolean, default: false },
  gst: { type: Number,  },
  tokenAmount: { type: Number },
});

const FranchiseModelDetailsSchema = new Schema({
  franchiseSize: { type: String,  },
  areaRequired: { type: String,  },
  marketing: { type: String },
  returnOfInvestment: { type: String },
  manPower: { type: Number,  },
  staffManagement: { type: String,  },

  royaltyPercent: { type: String,  },
  grossMargin: { type: String,  },
  radiusArea: { type: String,  },
});

const ExtraServiceSchema = new Schema({
  serviceId: { type: Types.ObjectId, ref: "Service" }, 
 investment: {
    type: [FranchiseInvestmentRangeSchema], 
    
  },
  model: {
    type: [FranchiseModelDetailsSchema],
    
  }
}, { timestamps: true });

const ExtraService = mongoose.models.ExtraService || model("ExtraService", ExtraServiceSchema);

export default ExtraService;