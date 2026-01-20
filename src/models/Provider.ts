import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

const onlyCharsRegex = /^[A-Za-z\s]+$/;

const minLength = (len: number) => ({
  validator: (v: string) => !v || v.length >= len,
  message: `Must be at least ${len} characters long`,
});

const onlyCharacters = {
  validator: (v: string) => !v || onlyCharsRegex.test(v),
  message: "Only alphabetic characters are allowed",
};


/* ─────────────── Interfaces ─────────────────────────── */

export interface Location {
  type: "home" | "office" | "other";
  coordinates: [number, number];
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
  aboutUs?: string;
  tags?: string[];
  totalProjects?: number;
  totalExperience?: string;
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
  _id: string;
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
  isStoreOpen?: boolean | null;
  isRecommended?: boolean;
  isTrending? : boolean;
  /* progress flags */
  step1Completed: boolean;
  storeInfoCompleted: boolean;
  kycCompleted: boolean;
  registrationStatus: "basic" | "store" | "kyc" | "done";
  resetPasswordToken: string;
  resetPasswordExpires: string;

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
    storeName: {
      type: String,
      trim: true,
      minlength: [3, "Store name must be at least 3 characters"],
      match: [onlyCharsRegex, "Store name must contain only letters"],
    },
    storePhone: { type: String, trim: true },
    storeEmail: { type: String, lowercase: true, trim: true },
    module: { type: Schema.Types.ObjectId, ref: "Module" },
    zone: { type: Schema.Types.ObjectId, ref: "Zone" },
    logo: String,
    cover: String,
    tax: String,
    location: locationSchema,
    address: {
      type: String,
      minlength: [5, "Address must be at least 5 characters"],
      trim: true,
    },
    officeNo: String,
    city: {
      type: String,
      trim: true,
      validate: onlyCharacters,
    },
    state: {
      type: String,
      trim: true,
      validate: onlyCharacters,
    },
    country: {
      type: String,
      trim: true,
      validate: onlyCharacters,
    },
    aboutUs: String,
    tags: { type: [String], default: [] },
    totalProjects : {
      type: Number,
      min: [0, "Total projects cannot be negative"],
    },
    totalExperience : {
      type: String
    },
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

    providerId: { type: String, unique: true },
    fullName: { type: String, required: true, trim: true },
    phoneNo: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },

    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    galleryImages: { type: [String], default: [] },
    storeInfo: storeInfoSchema,
    kyc: kycSchema,
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
    isStoreOpen: { type: Boolean, default: true },
    isRecommended: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },

    /* ––– Registration progress flags ––– */
    step1Completed: { type: Boolean, default: false },
    storeInfoCompleted: { type: Boolean, default: false },
    kycCompleted: { type: Boolean, default: false },
    registrationStatus: {
      type: String,
      enum: ["basic", "store", "kyc", "done"],
      default: "basic",
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: String },
  },
  { timestamps: true }
);

// Email unique for non-deleted providers
providerSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Phone number unique for non-deleted providers
providerSchema.index(
  { phoneNo: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Referral code unique only if it exists
providerSchema.index(
  { referralCode: 1 },
  { unique: true, sparse: true }
);

providerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password as string, 10);
  }

  if (!this.providerId) {
    const lastUser = await mongoose
      .model('Provider')
      .findOne({ providerId: { $regex: /^FTP\d+$/ } })
      .sort({ providerId: -1 })
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
