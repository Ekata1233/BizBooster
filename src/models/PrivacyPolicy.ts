import mongoose, { Document, Schema } from 'mongoose';

export interface IPrivacyPolicy extends Document {
  content: string;
}

const PrivacyPolicySchema: Schema = new Schema({
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });  
const PrivacyPolicy = mongoose.models.PrivacyPolicy || mongoose.model<IPrivacyPolicy>('PrivacyPolicy', PrivacyPolicySchema);

export default PrivacyPolicy;