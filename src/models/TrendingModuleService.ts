import mongoose, { Schema, Document } from "mongoose";

export interface ITrendingModuleService extends Document {
  moduleId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  isTrending: boolean;
}

const TrendingModuleServiceSchema = new Schema<ITrendingModuleService>(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    isTrending: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TrendingModuleServiceSchema.index({ moduleId: 1, serviceId: 1 }, { unique: true });

export default (mongoose.models.TrendingModuleService as mongoose.Model<ITrendingModuleService>) ||
  mongoose.model<ITrendingModuleService>("TrendingModuleService", TrendingModuleServiceSchema);
