import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProviderReview extends Document {
  user: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const providerReviewSchema = new Schema<IProviderReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);

const ProviderReview: Model<IProviderReview> = mongoose.models.ProviderReview || mongoose.model<IProviderReview>("ProviderReview", providerReviewSchema);
export default ProviderReview;
