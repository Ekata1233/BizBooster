import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String },
    // categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    isDeleted: { type: Boolean, default: false }, // Soft delete flag
  },
  { timestamps: true }
);

export default mongoose.models.Module || mongoose.model("Module", moduleSchema);
