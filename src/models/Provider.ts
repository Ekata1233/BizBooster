import mongoose, { Schema, Document } from "mongoose";
import bcrypt from 'bcrypt';

// Interfaces

export interface Location {
  type: 'home' | 'office' | 'other';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface StoreInfo {
  storeName: string;
  storePhone: string;
  storeEmail: string;
  module: mongoose.Types.ObjectId;
  zone: mongoose.Types.ObjectId;
  logo?: string;
  cover?: string;
  tax: string;
  location: Location;
  address: string;
  officeNo: string;
  city: string;
  state: string;
  country: string;
}

export interface KYC {
  aadhaarCard: string[];
  panCard: string[];
  storeDocument: string[];
  GST: string[];
  other: string[];
}

export interface ProviderDocument extends Document {
  fullName: string;
  phoneNo: string;
  email: string;
  password: string;
  confirmPassword?: string; // Usually not stored in DB
  referralCode?: string;
  referredBy: mongoose.Schema.Types.ObjectId,
  storeInfo: StoreInfo;
  kyc: KYC;
  setBusinessPlan?: 'commission base' | 'other';
  subscribedServices: mongoose.Types.ObjectId;
  isVerified: boolean;
  isDeleted: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema Definitions

const locationSchema = new Schema<Location>({
  type: {
    type: String,
    enum: ['home', 'office', 'other'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: function (v: number[]) {
        return v.length === 2;
      },
      message: 'Coordinates must be an array of two numbers [longitude, latitude].'
    }
  }
}, { _id: false });

const storeInfoSchema = new Schema<StoreInfo>({
  storeName: {
    type: String,
    required: true,
    trim: true,
  },
  storePhone: {
    type: String,
    required: true,
    trim: true,
  },
  storeEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  module: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Module',
  },
  zone: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Zone',
  },
  logo: {
    type: String,
  },
  cover: {
    type: String,
  },
  tax: {
    type: String,
    required: true,
  },
  location: {
    type: locationSchema,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  officeNo: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
}, { _id: false });

const kycSchema = new Schema<KYC>({
  aadhaarCard: {
    type: [String],
    required: true,
    default: [],
  },
  panCard: {
    type: [String],
    required: true,
    default: [],
  },
  storeDocument: {
    type: [String],
    required: true,
    default: [],
  },
  GST: {
    type: [String],
    default: [],
  },
  other: {
    type: [String],
    default: [],
  }
}, { _id: false });

const providerSchema = new Schema<ProviderDocument>({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNo: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // reference to the User model
    default: null,
  },
  storeInfo: {
    type: storeInfoSchema,
    required: true,
  },
  kyc: {
    type: kycSchema,
    required: true,
  },
  setBusinessPlan: {
    type: String,
    enum: ['commission base', 'other'],
  },
  subscribedServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Password hash middleware
providerSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Password comparison method
providerSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.Provider || mongoose.model<ProviderDocument>('Provider', providerSchema);
