import mongoose, { Document, Schema } from 'mongoose';

export interface IProviderCancellationPolicy extends Document {
  module: mongoose.Types.ObjectId; 
  content: string;
}

const ProviderCancellationPolicySchema: Schema<IProviderCancellationPolicy> = new Schema(
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

const ProviderCancellationPolicy =
  mongoose.models.ProviderCancellationPolicy ||
  mongoose.model<IProviderCancellationPolicy>('ProviderCancellationPolicy', ProviderCancellationPolicySchema);

export default ProviderCancellationPolicy;
