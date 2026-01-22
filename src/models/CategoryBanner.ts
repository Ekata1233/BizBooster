import mongoose from "mongoose";

const categoryBannerSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.CategoryBanner ||
  mongoose.model("CategoryBanner", categoryBannerSchema);
