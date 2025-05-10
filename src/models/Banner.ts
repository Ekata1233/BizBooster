import mongoose, { Document, Schema } from "mongoose";

export interface IBanner extends Document {
  image: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    image: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Banner || mongoose.model<IBanner>("Banner", bannerSchema);
