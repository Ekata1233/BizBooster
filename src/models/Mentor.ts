
import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Mentor ||
  mongoose.model("Mentor", mentorSchema);
