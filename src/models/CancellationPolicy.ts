import mongoose, { Document, Schema } from 'mongoose';

export interface ICancellationPolicy extends Document {
  content: string;
}

const CancellationPolicySchema: Schema = new Schema({
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });  
const CancellationPolicy = mongoose.models.CancellationPolicy || mongoose.model<ICancellationPolicy>('CancellationPolicy', CancellationPolicySchema);

export default CancellationPolicy;