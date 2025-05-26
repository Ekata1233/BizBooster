import mongoose from "mongoose";

const WhyChooseSchema = new mongoose.Schema(
  {
    title: { type: String },
    image: { type: String,  required: true },
    description: { type: String },
    extraSections: [
      {
        description: { type: String }
      }
    ],
    isDeleted: { type: Boolean, default: false }, // Soft delete flag

  },
  { timestamps: true }
);

export default mongoose.models.WhyChoose || mongoose.model("WhyChoose", WhyChooseSchema);
