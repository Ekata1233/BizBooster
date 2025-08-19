// models/FiveXGuarantee.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IFiveXGuarantee extends Document {
  leadcount: number;
  fixearning: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const FiveXSchema = new Schema<IFiveXGuarantee>(
  {
    leadcount: { type: Number, required: true },
    fixearning: { type: Number, required: true },
  },
  { timestamps: true }
);

// Prevent model overwrite error in dev / HMR
const FiveXGuarantee = (mongoose.models.FiveXGuarantee as mongoose.Model<IFiveXGuarantee>) ||
  mongoose.model<IFiveXGuarantee>("FiveXGuarantee", FiveXSchema);

export default FiveXGuarantee;
