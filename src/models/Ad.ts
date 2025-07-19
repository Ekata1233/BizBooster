import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IAd extends Document {
  addType: 'video' | 'image';
  category: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  provider: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  title: string;
  description: string;
  fileUrl: string;
  isExpired:boolean;
  isApproved: boolean;
}

const AdSchema = new Schema<IAd>(
  {
    addType: {
      type: String,
      enum: ['video', 'image'],
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    isExpired: { type: Boolean, default: false },
    isApproved: {type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Ad = models.Ad || model<IAd>('Ad', AdSchema);
