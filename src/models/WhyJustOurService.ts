import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWhyJustOurService extends Document {
  title: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

const WhyJustOurServiceSchema: Schema<IWhyJustOurService> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const WhyJustOurService: Model<IWhyJustOurService> =
  mongoose.models.WhyJustOurService ||
  mongoose.model<IWhyJustOurService>(
    "WhyJustOurService",
    WhyJustOurServiceSchema
  );

export default WhyJustOurService;
