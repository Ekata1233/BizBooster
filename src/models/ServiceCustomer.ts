// import mongoose, { Document, Schema } from "mongoose";

// // TypeScript Interface
// export interface IServiceCustomer extends Document {
//     customerId : string;
//     fullName: string;
//     phone: string;
//     email: string;
//     description: string;
//     address: string;
//     city: string;
//     state: string;
//     country: string;
//     otp?: {
//         code?: string;
//         expiresAt?: Date;
//         verified?: boolean;
//     };
//     user: mongoose.Types.ObjectId;
//     isDeleted: boolean;
//     createdAt?: Date;
//     updatedAt?: Date;
// }

// // Mongoose Schema
// const serviceCustomerSchema: Schema = new mongoose.Schema(
//     {
//         customerId: {
//             type: String,
//             unique: true,
//         },
//         fullName: {
//             type: String,
//             required: [true, "Full name is required"],
//             trim: true,
//             minlength: [2, "Full name must be at least 2 characters"],
//             maxlength: [100, "Full name can’t exceed 100 characters"],
//         },
//         phone: {
//             type: String,
//             required: [true, "Phone number is required"],
//             trim: true,
//             match: [/^\d{10}$/, "Phone number must be a 10-digit number"],
//         },
//         email: {
//             type: String,
//             required: [true, "Email is required"],
//             lowercase: true,
//             trim: true,
//             match: [/.+@.+\..+/, "Please provide a valid email address"],
//         },
//         description : {
//             type : String,
//             trim: true,
//         },
//         address: {
//             type: String,
//             required: [true, "Address is required"],
//             trim: true,
//             minlength: [5, "Address must be at least 5 characters"],
//         },
//         city: {
//             type: String,
//             required: [true, "City is required"],
//             trim: true,
//         },
//         state: {
//             type: String,
//             required: [true, "State is required"],
//             trim: true,
//         },
//         country: {
//             type: String,
//             required: [true, "Country is required"],
//             trim: true,
//             minlength: [2, "Country must be at least 2 characters"],
//         },
//         otp: {
//             code: { type: String },
//             expiresAt: { type: Date },
//             verified: { type: Boolean, default: false },
//         },
//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User"
//         },
//         isDeleted: {
//             type: Boolean,
//             default: false,
//         },
//     },
//     { timestamps: true }
// );

// // Add these after defining the schema
// serviceCustomerSchema.index({ user: 1, phone: 1 }, { unique: true });
// serviceCustomerSchema.index({ user: 1, email: 1 }, { unique: true });


// serviceCustomerSchema.pre<IServiceCustomer>("save", async function (next) {
//     if (this.isNew && !this.customerId) {
//         const lastCustomer = await mongoose
//             .model<IServiceCustomer>("ServiceCustomer")
//             .findOne({})
//             .sort({ createdAt: -1 })
//             .lean();

//         let lastId = 0;
//         if (lastCustomer && lastCustomer.customerId) {
//             const match = lastCustomer.customerId.match(/FTC(\d+)/);
//             if (match && match[1]) {
//                 lastId = parseInt(match[1], 10);
//             }
//         }

//         const newId = lastId + 1;
//         this.customerId = `FTC${newId.toString().padStart(5, "0")}`;
//     }
//     next();
// });

// // Export the model
// export default mongoose.models.ServiceCustomer ||
//     mongoose.model<IServiceCustomer>("ServiceCustomer", serviceCustomerSchema);


import mongoose, { Document, Schema } from "mongoose";

// TypeScript Interface
export interface IServiceCustomer extends Document {
  customerId: string;
  fullName: string;
  phone: string;
  email: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  otp?: {
    code?: string;
    expiresAt?: Date;
    verified?: boolean;
  };
  user: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Mongoose Schema
const serviceCustomerSchema: Schema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name can’t exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\d{10}$/, "Phone number must be a 10-digit number"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please provide a valid email address"],
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
      verified: { type: Boolean, default: false },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-generate customerId
serviceCustomerSchema.pre<IServiceCustomer>("save", async function (next) {
  if (this.isNew && !this.customerId) {
    const lastCustomer = await mongoose
      .model<IServiceCustomer>("ServiceCustomer")
      .findOne({})
      .sort({ createdAt: -1 })
      .lean();

    let lastId = 0;
    if (lastCustomer?.customerId) {
      const match = lastCustomer.customerId.match(/FTC(\d+)/);
      if (match?.[1]) lastId = parseInt(match[1], 10);
    }

    const newId = lastId + 1;
    this.customerId = `FTC${newId.toString().padStart(5, "0")}`;
  }
  next();
});

// Compound unique indexes
serviceCustomerSchema.index({ user: 1, phone: 1 }, { unique: true });
serviceCustomerSchema.index({ user: 1, email: 1 }, { unique: true });

// Export the model
export default mongoose.models.ServiceCustomer ||
  mongoose.model<IServiceCustomer>("ServiceCustomer", serviceCustomerSchema);
