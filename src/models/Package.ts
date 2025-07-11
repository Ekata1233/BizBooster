// /models/Package.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPackage extends Document {
  description: {
    gp: string;
    sgp: string;
    pgp: string;
  };
  price: number;
  discount: number;
  discountedPrice: number;
  deposit: number;
}

const packageSchema = new Schema<IPackage>({
  description: {
    gp: { type: String, required: true },
    sgp: { type: String, default: '' },
    pgp: { type: String, default: '' },
  },
  price: { type: Number, required: true },
  discount: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  deposit: { type: Number, required: true },
}, { timestamps: true });


export const Package =
  mongoose.models.Package || mongoose.model<IPackage>('Package', packageSchema);

