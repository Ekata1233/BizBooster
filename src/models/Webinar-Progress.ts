import mongoose, { Schema, Document } from "mongoose";

interface IWebinarProgress extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  webinarId: mongoose.Schema.Types.ObjectId;
  isCompleted: boolean; // attended/completed
  joinCount: number;    // number of times joined
}

const WebinarProgressSchema: Schema = new Schema<IWebinarProgress>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    webinarId: { type: mongoose.Schema.Types.ObjectId, ref: "LiveWebinars", required: true },
    isCompleted: { type: Boolean, default: false },
    joinCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

WebinarProgressSchema.index({ userId: 1, webinarId: 1 }, { unique: true });

const WebinarProgress =
  mongoose.models.WebinarProgress ||
  mongoose.model<IWebinarProgress>("WebinarProgress", WebinarProgressSchema);

export default WebinarProgress;
