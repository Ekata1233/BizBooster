import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { string } from 'zod';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    match: [/^[A-Za-z]+(?: [A-Za-z]+)*$/, 'Full name must be 2-30 alphabetic characters and may include spaces'],
    minlength: 2,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Email format is invalid']
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\+?\d{10,15}$/, 'Mobile number format is invalid']
  },
  address: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
  },
  profilePhoto: {
    type: String,
  },
  password: {
    type: String,
    required: true
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true, // Ensures MongoDB ignores null/undefined in unique index
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // reference to the User model
    default: null,
  },
  myTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAgree: {
    type: Boolean,
    required: true
  },
  otp: {
    code: String,
    expiresAt: Date,
    verified: { type: Boolean, default: true }
  },
  isEmailVerified: {
    type: Boolean,
    default: true
  },
  isMobileVerified: {
    type: Boolean,
    default: true
  },
  serviceCustomers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceCustomer"
  }],
  packageType: {
    type: String,
    enum: ['partial', 'full'],
    default: null, // starts as null
  },
  packageActive: {
    type: Boolean,
    default: false
  },
  isCommissionDistribute: {
    type: Boolean,
    default: false
  },
  favoriteServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  favoriteProviders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  return bcrypt.compare(candidatePassword, this.password);
};
export default mongoose.models.User || mongoose.model('User', userSchema);
