import { Schema, model, models, Document } from "mongoose";

// 👇 Interface for TypeScript type safety
export interface IEmployee extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  role: "admin" | "manager" | "staff";
  address: string;
  profileImage: string; // store image URL or path

  identityType: "aadhar" | "pan" | "passport";
  identityNumber: string;
  identityImage: string; // store image URL or path

  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 👇 Mongoose Schema
const EmployeeSchema = new Schema<IEmployee>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/, // enforce 10 digits
      unique: true,
    },
    role: {
      type: String,
      required: true,
    },
    address: { type: String, required: true },

    profileImage: { type: String, required: true }, // will save image URL or cloud path

    identityType: {
      type: String,
      enum: ["aadhar", "pan", "passport"],
      required: true,
    },
    identityNumber: { type: String, required: true, unique: true },
    identityImage: { type: String, required: true },

    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },

    // timestamps
  },
  { timestamps: true }
);

const Employee =
  models.Employee || model<IEmployee>("Employee", EmployeeSchema);

export default Employee;
