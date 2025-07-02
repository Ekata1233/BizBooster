import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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
  isAgree: {
    type: Boolean,
    required: true
  },
  otp: {
    code: String,
    expiresAt: Date,
    verified: { type: Boolean, default: false }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isMobileVerified: {
    type: Boolean,
    default: false
  },
  serviceCustomers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceCustomer"
  }],
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
