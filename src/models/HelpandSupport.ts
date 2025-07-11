import mongoose, { Document, Schema } from 'mongoose';

export interface IHelpAndSupport extends Document {
  user: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  createdAt: Date;
}

const HelpAndSupportSchema: Schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // This assumes your user model is named 'User'
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
   
      trim: true,
    },
  },
  { timestamps: true } 
);

const HelpAndSupport =
  mongoose.models.HelpAndSupport ||
  mongoose.model<IHelpAndSupport>('HelpAndSupport', HelpAndSupportSchema);

export default HelpAndSupport;
