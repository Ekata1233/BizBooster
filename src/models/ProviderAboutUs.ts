import mongoose, { Document, Schema } from 'mongoose';

export interface IProviderAboutUs extends Document {
  module: mongoose.Types.ObjectId;
  content: string;
}

const ProviderAboutUsSchema: Schema<IProviderAboutUs> = new Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ProviderAboutUs =
  mongoose.models.ProviderAboutUs ||
  mongoose.model<IProviderAboutUs>('ProviderAboutUs', ProviderAboutUsSchema);

export default ProviderAboutUs;
