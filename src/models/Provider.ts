import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

/* ─────────────── Interfaces ─────────────────────────── */

export interface Location {
  type: "home" | "office" | "other";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface StoreInfo {
  storeName?: string;
  storePhone?: string;
  storeEmail?: string;
  module?: mongoose.Types.ObjectId;
  zone?: mongoose.Types.ObjectId;
  logo?: string;
  cover?: string;
  tax?: string;
  location?: Location;
  address?: string;
  officeNo?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface KYC {
  aadhaarCard?: string[];
  panCard?: string[];
  storeDocument?: string[];
  GST?: string[];
  other?: string[];
}

export interface ProviderDocument extends Document {
  /* step-1 */
  providerId: string;
  fullName: string;
  phoneNo: string;
  email: string;
  password: string;
  confirmPassword?: string;
  referralCode?: string;
  referredBy?: mongoose.Schema.Types.ObjectId;
  galleryImages?: string[];

  /* step-2 */
  storeInfo?: StoreInfo;

  /* step-3 */
  kyc?: KYC;

  /* misc */
  setBusinessPlan?: "commission base" | "other";
  subscribedServices?: mongoose.Types.ObjectId[];
  averageRating?: number;
  totalReviews?: number;
  isRejected: boolean;
  isApproved: boolean;
  isVerified: boolean;
  isDeleted: boolean;

  /* progress flags */
  step1Completed: boolean;
  storeInfoCompleted: boolean;
  kycCompleted: boolean;
  registrationStatus: "basic" | "store" | "kyc" | "done";

  /* methods */
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/* ─────────────── Sub-Schemas ────────────────────────── */

const locationSchema = new Schema<Location>(
  {
    type: { type: String, enum: ["home", "office", "other"] },
    coordinates: {
      type: [Number],
      validate: {
        validator: (v: number[]) => v.length === 2,
        message:
          "Coordinates must be an array of two numbers [longitude, latitude].",
      },
    },
  },
  { _id: false }
);

const storeInfoSchema = new Schema<StoreInfo>(
  {
    storeName: { type: String, trim: true },
    storePhone: { type: String, trim: true },
    storeEmail: { type: String, lowercase: true, trim: true },
    module: { type: Schema.Types.ObjectId, ref: "Module" },
    zone: { type: Schema.Types.ObjectId, ref: "Zone" },
    logo: String,
    cover: String,
    tax: String,
    location: locationSchema,
    address: String,
    officeNo: String,
    city: String,
    state: String,
    country: String,
  },
  { _id: false }
);

const kycSchema = new Schema<KYC>(
  {
    aadhaarCard: { type: [String], default: [] },
    panCard: { type: [String], default: [] },
    storeDocument: { type: [String], default: [] },
    GST: { type: [String], default: [] },
    other: { type: [String], default: [] },
  },
  { _id: false }
);

/* ─────────────── Main Provider Schema ──────────────── */

const providerSchema = new Schema<ProviderDocument>(
  {
    /* ––– Step-1 fields ––– */
    providerId: { type: String, unique: true },
    fullName: { type: String, required: true, trim: true },
    phoneNo: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },

    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    galleryImages: { type: [String], default: [] },

    /* ––– Step-2 – Store Info ––– */
    storeInfo: storeInfoSchema,

    /* ––– Step-3 – KYC ––– */
    kyc: kycSchema,

    /* ––– Other business fields ––– */
    setBusinessPlan: { type: String, enum: ["commission base", "other"] },
    subscribedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    averageRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    isRejected: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },

    /* ––– Registration progress flags ––– */
    step1Completed: { type: Boolean, default: false },
    storeInfoCompleted: { type: Boolean, default: false },
    kycCompleted: { type: Boolean, default: false },
    registrationStatus: {
      type: String,
      enum: ["basic", "store", "kyc", "done"],
      default: "basic",
    },
  },
  { timestamps: true }
);

/* ─────────────── Hooks & Methods ──────────────── */

// Hash password before save / update
providerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password as string, 10);
  }

   if (!this.providerId) {
      const lastUser = await mongoose
        .model('Provider')
        .findOne({ providerId: { $regex: /^FTP\d+$/ } })
        .sort({ createdAt: -1 })
        .select('providerId');
  
      let nextId = 1;
      if (lastUser?.providerId) {
        const numericPart = parseInt(lastUser.providerId.replace('FTP', ''), 10);
        if (!isNaN(numericPart)) {
          nextId = numericPart + 1;
        }
      }
  
      this.providerId = `FTP${String(nextId).padStart(6, '0')}`;
    }

  next();
});

// Compare password
providerSchema.methods.comparePassword = function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password as string);
};

/* ─────────────── Model Export ──────────────── */

export default mongoose.models.Provider ||
  mongoose.model<ProviderDocument>("Provider", providerSchema);
