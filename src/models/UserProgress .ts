import mongoose, { Schema, Document } from 'mongoose';

// Define the document interface
interface IVideoProgress extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  certificateId: mongoose.Schema.Types.ObjectId;
  videoId: mongoose.Schema.Types.ObjectId; // Reference to a specific video
  isCompleted: boolean;
}

// Define the schema
const VideoProgressSchema: Schema = new Schema<IVideoProgress>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certifications',
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      // You'll need to reference the specific video ID if your videos are in a separate collection.
      // If videos are embedded in the Certifications schema, this would be an index or a unique video ID.
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// A compound index to ensure a user only has one progress record for each specific video
VideoProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

// Export the model
const VideoProgress =
  mongoose.models.VideoProgress ||
  mongoose.model<IVideoProgress>('VideoProgress', VideoProgressSchema);

export default VideoProgress;