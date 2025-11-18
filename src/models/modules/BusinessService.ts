import mongoose, { Schema, Document } from "mongoose";

export interface IServiceBase extends Document {
  moduleId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  serviceName: string;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceBaseSchema = new Schema<IServiceBase>(
  {
    moduleId: { type: Schema.Types.ObjectId, required: true },
    categoryId: { type: Schema.Types.ObjectId, required: true },
    serviceName: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    discriminatorKey: "serviceType", // this decides module
    collection: "services"
  }
);

export const ServiceBase =
  mongoose.models.ServiceBase ||
  mongoose.model<IServiceBase>("ServiceBase", ServiceBaseSchema);

export default ServiceBase;
