import mongoose, { Document, Schema } from 'mongoose';

export interface IProviderRefundPolicy extends Document {
  module: mongoose.Types.ObjectId;
  content: string;
}

const ProviderRefundPolicySchema: Schema<IProviderRefundPolicy> = new Schema(
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

const ProviderRefundPolicy =
  mongoose.models.ProviderRefundPolicy ||
  mongoose.model<IProviderRefundPolicy>('ProviderRefundPolicy', ProviderRefundPolicySchema);

export default ProviderRefundPolicy;
