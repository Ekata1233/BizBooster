import mongoose, { Document, Schema } from "mongoose";

export type BannerPageType = "homepage" | "categorypage";

interface ImageInfo {
  url: string;
  category:  { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
}

export interface IBanner extends Document {
  images: ImageInfo[];
  page: BannerPageType;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const imageInfoSchema = new Schema<ImageInfo>(
  {
    url: { type: String, required: true },
    category: { type: String, required: true },
    module: { type: String, required: true },
  },
  { _id: false }
);

const bannerSchema = new Schema<IBanner>(
  {
    images: { type: [imageInfoSchema], required: true },
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
