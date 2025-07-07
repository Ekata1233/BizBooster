import mongoose, { Document, Schema } from 'mongoose';

export interface ITermsConditions extends Document {
  content: string;
}

const TermsConditionsSchema: Schema = new Schema({
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });  
const TermsConditions = mongoose.models.TermsConditions || mongoose.model<ITermsConditions>('TermsConditions', TermsConditionsSchema);

export default TermsConditions;