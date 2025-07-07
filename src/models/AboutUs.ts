import mongoose, { Document, Schema } from 'mongoose';

export interface IAboutUs extends Document {
  content: string;
}

const AboutUsSchema: Schema = new Schema({
  content: {
    type: String,
  },
}, { timestamps: true });  
const AboutUs = mongoose.models.AboutUs || mongoose.model<IAboutUs>('AboutUs', AboutUsSchema);

export default AboutUs;