// src/models/Banner.ts

import mongoose, { Document, Schema } from "mongoose";

export type BannerPageType = "homepage" | "categorypage";

export interface IBanner extends Document {
  images: string[]; // array of image URLs
  page: BannerPageType;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    images: { type: [String], required: true }, // array of image URLs
    page: {
      type: String,
      enum: ["homepage", "categorypage"],
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Banner ||
  mongoose.model<IBanner>("Banner", bannerSchema);
