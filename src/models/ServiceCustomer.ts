import mongoose, { Document, Schema } from "mongoose";

// TypeScript Interface
export interface IServiceCustomer extends Document {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    country: string;
    otp?: {
        code?: string;
        expiresAt?: Date;
        verified?: boolean;
    };
    provider: mongoose.Types.ObjectId;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Mongoose Schema
const serviceCustomerSchema: Schema = new mongoose.Schema(
    {
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
            unique: true,
            trim: true,
            match: [/^\d{10}$/, "Phone number must be a 10-digit number"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/.+@.+\..+/, "Please provide a valid email address"],
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
            minlength: [5, "Address must be at least 5 characters"],
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
            minlength: [2, "Country must be at least 2 characters"],
        },
        otp: {
            code: { type: String },
            expiresAt: { type: Date },
            verified: { type: Boolean, default: false },
        },
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Provider"
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Export the model
export default mongoose.models.ServiceCustomer ||
    mongoose.model<IServiceCustomer>("ServiceCustomer", serviceCustomerSchema);
