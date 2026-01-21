import mongoose, { Schema, Document, Model } from "mongoose";

export interface IServiceItem {
  title: string;
  description: string;
  icon: string;
    list?: string;
}

export interface IWhyJustOurService extends Document {
  items: IServiceItem[];          // 🔥 multiple title/desc/icon
  module: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceItemSchema = new Schema<IServiceItem>(
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
    list: {
      type: String, // ✅ optional field
      trim: true,
    },
  },
  { _id: false } // prevents extra _id inside array
);

const WhyJustOurServiceSchema: Schema<IWhyJustOurService> = new Schema(
  {
    items: {
      type: [ServiceItemSchema], // ✅ array of items
      required: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
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
