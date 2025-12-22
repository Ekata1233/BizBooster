import mongoose, { Schema, Document, Model } from "mongoose";
import Module from "./Module"; // import your Module model

export interface IWhyJustOurService extends Document {
  title: string;
  description: string;
  icon: string;
  module: mongoose.Types.ObjectId; // reference to Module
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
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module", // references Module collection
      required: [true, "Module is required"],
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
