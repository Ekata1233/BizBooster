import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String },
    isDeleted: { type: Boolean, default: false },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true }
);

// ✅ THIS LINE is crucial
export default mongoose.models.Subcategory || mongoose.model("Subcategory", subcategorySchema);
