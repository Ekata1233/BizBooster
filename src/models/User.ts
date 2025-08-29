import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { string } from 'zod';

const addressSchema = new mongoose.Schema({
  houseNumber: String,
  landmark: String,
  state: String,
  city: String,
  pinCode: String,
  country: String,
  fullAddress: String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
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
    // unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Email format is invalid']
  },
  mobileNumber: {
    type: String,
    required: true,
    // unique: true,
    trim: true,
    match: [/^\+?\d{10,15}$/, 'Mobile number format is invalid']
  },
  personalDetailsCompleted: { type: Boolean, default: false },
  profilePhoto: {
    type: String,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married'],
  },
  bloodGroup: {
    type: String,
    enum: ['a+', 'a-', 'b+', 'b-', 'o+', 'o-', 'ab+', 'ab-'],
    lowercase: true
  },
  dateOfBirth: {
    type: Date,
  },
  education: {
    type: String,
  },
  profession: {
    type: String,
  },
  emergencyContact: {
    type: String,
    trim: true,
    match: [/^\+?\d{10,15}$/, 'Mobile number format is invalid']
  },
  additionalDetailsCompleted: { type: Boolean, default: false },

  homeAddress: addressSchema,
  workAddress: addressSchema,
  otherAddress: addressSchema,
  addressCompleted: { type: Boolean, default: false },

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
  packageAmountPaid: {
    type: Number,
    default: 0, // how much the user has paid in total
  },
  remainingAmount: {
    type: Number,
    default: 0, // how much the user has paid in total
  },
  packagePrice: {
    type: Number,
    default: 0,
  },
  packageType: {
    type: String,
    enum: ['none', 'partial', 'full'],
    default: null,
  },
  packageActive: {
    type: Boolean,
    default: false
  },
  isCommissionDistribute: {
    type: Boolean,
    default: false
  },
 packageActivateDate: {
  type: Date,   // <-- Capital D
  default: null // or Date.now if you want the current timestamp
},
packageStatus: { type: String, enum: [ "GP", "SGP", "PGP"] },

  favoriteServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  favoriteProviders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

userSchema.index(
  { mobileNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (!this.userId) {
    const lastUser = await mongoose
      .model('User')
      .findOne({ userId: { $regex: /^FTF\d+$/ } })
      .sort({ createdAt: -1 })
      .select('userId');

    let nextId = 1;
    if (lastUser?.userId) {
      const numericPart = parseInt(lastUser.userId.replace('FTF', ''), 10);
      if (!isNaN(numericPart)) {
        nextId = numericPart + 1;
      }
    }

    this.userId = `FTF${String(nextId).padStart(6, '0')}`;
  }

  next();
});
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  return bcrypt.compare(candidatePassword, this.password);
};
export default mongoose.models.User || mongoose.model('User', userSchema);
