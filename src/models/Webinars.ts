import mongoose, { Schema, Document, Model } from 'mongoose'; // Import Model and Document

// Define the interface for a single video subdocument
export interface IVideo {
  videoName: string;
  videoUrl: string;
  videoDescription: string; // This field will now be optional in terms of 'required'
}

// Define the interface for the main Webinar document
export interface IWebinar extends Document {
  name: string;
  imageUrl: string;
  description: string;
  video: IVideo[]; // Array of video subdocuments
  createdAt: Date; // Added for clarity, as timestamps: true adds it
  updatedAt: Date; // Added for clarity, as timestamps: true adds it
}

// Define the Schema for individual Video subdocuments
const VideoSchema: Schema = new Schema({
  videoName: {
    type: String,
    required: [true, 'Video name is required.'], // Name is usually required
    trim: true,
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required.'], // URL is definitely required for a video
  },
  videoDescription: {
    type: String,
    // Removed 'required: true' to allow partial updates of video metadata
    default: "", // Provide a default empty string if not provided
  },
});

// Define the main Webinars Schema
const WebinarsSchema: Schema = new Schema<IWebinar>({
  name: {
    type: String,
    required: [true, 'Webinar name is required.'],
    unique: true, // Keep unique for name
    trim: true,
  },
  imageUrl: {
    type: String,
    required: [true, 'Webinar image URL is required.'], // Keep required for the main image
  },
  description: {
    type: String,
    default: "",
  },
  video: [VideoSchema], // Array of video subdocuments
}, { timestamps: true });

// Ensure the model is only compiled once in Next.js development mode
const Webinars: Model<IWebinar> =
  (mongoose.models.Webinars as Model<IWebinar>) ||
  mongoose.model<IWebinar>('Webinars', WebinarsSchema);

export default Webinars;