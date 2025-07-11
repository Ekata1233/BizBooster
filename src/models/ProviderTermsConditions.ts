import mongoose, { Document, Schema } from 'mongoose';

export interface IProviderTermsConditions extends Document {
  module: mongoose.Types.ObjectId;
  content: string;
}

const ProviderTermsConditionsSchema: Schema<IProviderTermsConditions> = new Schema(
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

const ProviderTermsConditions =
  mongoose.models.ProviderTermsConditions ||
  mongoose.model<IProviderTermsConditions>('ProviderTermsConditions', ProviderTermsConditionsSchema);

export default ProviderTermsConditions;
