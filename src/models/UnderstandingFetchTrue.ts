import mongoose, { Document, Schema } from 'mongoose';

export interface VideoItem {
  fileName: string;
  filePath: string;
}

export interface IUnderstandingFetchTrue extends Document {
  fullName: string;
  videoUrl: VideoItem[];
  createdAt: Date;
}

const underStandingFetchTrueSchema = new Schema<IUnderstandingFetchTrue>(
  {
    fullName: {
      type: String,
      required: true,
      match: [/^[A-Za-z]+(?: [A-Za-z]+)*$/, 'Full name must be 2-30 alphabetic characters and may include spaces'],
      minlength: 2,
      maxlength: 30,
    },
    videoUrl: [
      {
        fileName: { type: String, required: true },
        filePath: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true, // Enables createdAt & updatedAt
  }
);

const UnderStandingFetchTrue =
  mongoose.models.UnderStandingFetchTrue ||
  mongoose.model<IUnderstandingFetchTrue>('UnderStandingFetchTrue', underStandingFetchTrueSchema);

export default UnderStandingFetchTrue;
