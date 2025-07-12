import mongoose, { Document, Schema } from 'mongoose';

export interface IProviderPrivacyPolicy extends Document {
  module: mongoose.Types.ObjectId;
  content: string;
  documentUrls?: string[]; 
}

const ProviderPrivacyPolicySchema: Schema<IProviderPrivacyPolicy> = new Schema(
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
    documentUrls: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const ProviderPrivacyPolicy =
  mongoose.models.ProviderPrivacyPolicy ||
  mongoose.model<IProviderPrivacyPolicy>(
    'ProviderPrivacyPolicy',
    ProviderPrivacyPolicySchema
  );

export default ProviderPrivacyPolicy;
