import mongoose, { Schema, Document, Model } from "mongoose";

export interface IServiceBase extends Document {
  moduleId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  subCategoryId?: mongoose.Types.ObjectId | null;
  serviceName: string;
  shortDescription?: string;
  bannerImage?: string;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  serviceType: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceBaseSchema = new Schema<IServiceBase>(
  {
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: "Module",
       required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
       required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
      required: false, // optional
    },
    serviceName: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
    },
    bannerImage: {
      type: String,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "serviceType", // ⭐ REQUIRED FOR POLYMORPHIC MODELS
  }
);

const ServiceBase: Model<IServiceBase> =
  mongoose.models.ServiceBase ||
  mongoose.model<IServiceBase>("ServiceBase", ServiceBaseSchema);

export default ServiceBase;
