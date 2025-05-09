import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" }],
    image: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
