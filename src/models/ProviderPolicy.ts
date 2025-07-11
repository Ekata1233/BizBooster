import mongoose, { Document, Schema } from 'mongoose';

export interface IProviderPolicy extends Document {
  module: mongoose.Types.ObjectId; 
  content: string;
}

const ProviderPolicySchema: Schema<IProviderPolicy> = new Schema(
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

const ProviderPolicy =
  mongoose.models.ProviderPolicy ||
  mongoose.model<IProviderPolicy>('ProviderPolicy', ProviderPolicySchema);

export default ProviderPolicy;
