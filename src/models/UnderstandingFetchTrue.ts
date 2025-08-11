import mongoose, { Document, Schema } from 'mongoose';

export interface IUnderstandingFetchTrue extends Document {
  fullName: string;
  imageUrl: string;
  description: string;
  videoUrl: string;
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
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UnderStandingFetchTrue =
  mongoose.models.UnderStandingFetchTrue ||
  mongoose.model<IUnderstandingFetchTrue>('UnderStandingFetchTrue', underStandingFetchTrueSchema);

export default UnderStandingFetchTrue;
