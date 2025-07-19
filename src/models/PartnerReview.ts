import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the PartnerReview document
export interface IPartnerReview extends Document {
  title?: string;        // Optional: Title for the video/image entry
  description?: string;  // Optional: Description for the video/image entry
  imageUrl: string;      // Required: URL of the image that will be displayed
  videoUrl: string;      // Required: URL of the video that will play when the image is clicked
}

// Define the Mongoose schema for PartnerReview
const PartnerReviewSchema: Schema = new Schema({
  title: {
    type: String,
    required: false, // Optional field
  },
  description: {
    type: String,
    required: false, // Optional field
  },
  imageUrl: {
    type: String,
    required: true, // Image URL is required
  },
  videoUrl: {
    type: String,
    required: true, // Video URL is required
  },
}, { 
  timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

// Create and export the Mongoose model
const PartnerReview = mongoose.models.PartnerReview || mongoose.model<IPartnerReview>('PartnerReview', PartnerReviewSchema);

export default PartnerReview;
