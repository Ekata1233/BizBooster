import mongoose, { Document, Schema } from 'mongoose';

export interface IRefundPolicy extends Document {
  content: string;
}

const RefundPolicySchema: Schema = new Schema({
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });  
const RefundPolicy = mongoose.models.RefundPolicy || mongoose.model<IRefundPolicy>('RefundPolicy', RefundPolicySchema);

export default RefundPolicy;