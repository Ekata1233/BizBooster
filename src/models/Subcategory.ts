import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true , unique: true},
    image: { type: String },
    isDeleted: { type: Boolean, default: false },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ THIS LINE is crucial
export default mongoose.models.Subcategory || mongoose.model("Subcategory", subcategorySchema);
