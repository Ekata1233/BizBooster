import mongoose from "mongoose";

const WhyChooseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    extraSections: [
      {
        description: { type: String, required: true }
      }
    ],
    isDeleted: { type: Boolean, default: false }, // Soft delete flag

  },
  { timestamps: true }
);

export default mongoose.models.WhyChoose || mongoose.model("WhyChoose", WhyChooseSchema);
