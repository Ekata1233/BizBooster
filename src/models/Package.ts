// /models/Package.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPackage extends Document {
  description: string;
  price: number;
  discount: number;
  discountedPrice: number;
  deposit: number;
}

const packageSchema = new Schema<IPackage>(
  {
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    deposit: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Package =
  mongoose.models.Package || mongoose.model<IPackage>('Package', packageSchema);
