// import mongoose, { Schema, Document, Model } from 'mongoose'; // Import Model and Document

// // Define the interface for a single video subdocument
// export interface IVideo {
//   videoName: string;
//   videoUrl: string;
//   videoDescription: string;
//   videoImageUrl: string; // This field will now be optional in terms of 'required'
// }

// // Define the interface for the main Webinar document
// export interface IWebinar extends Document {
//   name: string;
//   imageUrl: string;
//   description: string;
//   video: IVideo[]; // Array of video subdocuments
//   createdAt: Date; // Added for clarity, as timestamps: true adds it
//   updatedAt: Date; // Added for clarity, as timestamps: true adds it
// }

// // Define the Schema for individual Video subdocuments
// const VideoSchema: Schema = new Schema({
//   videoName: {
//     type: String,
//     required: [true, 'Video name is required.'], // Name is usually required
//     trim: true,
//   },
//   videoUrl: {
//     type: String,
//     required: [true, 'Video URL is required.'], // URL is definitely required for a video
//   },
//   videoDescription: {
//     type: String,

//     default: "",
//   },
//   videoImageUrl:
//   {
//     type: String,
//     required: [true, 'Video image is required'],
//   },
// });

// // Define the main Webinars Schema
// const WebinarsSchema: Schema = new Schema<IWebinar>({
//   name: {
//     type: String,
//     required: [true, 'Webinar name is required.'],
//     unique: true, // Keep unique for name
//     trim: true,
//   },
//   imageUrl: {
//     type: String,
//     required: [true, 'Webinar image URL is required.'], // Keep required for the main image
//   },
//   description: {
//     type: String,
//     default: "",
//   },
//   video: [VideoSchema], // Array of video subdocuments
// }, { timestamps: true });

// // Ensure the model is only compiled once in Next.js development mode
// const Webinars: Model<IWebinar> =
//   (mongoose.models.Webinars as Model<IWebinar>) ||
//   mongoose.model<IWebinar>('Webinars', WebinarsSchema);

// export default Webinars;


import mongoose, { Schema, Document } from 'mongoose';

interface IVideo {
    videoName: string;
    videoUrl: string;
    videoDescription: string;
    videoImageUrl: string;
}

interface IWebinar extends Document {
    name: string;
    imageUrl: string;
    description?: string;
    video: IVideo[];
}

const WebinarsSchema: Schema = new Schema<IWebinar>(
    {
        name: {
            type: String,
            required: [true, 'Webinar name is required'],
            unique: true,
            trim: true,
        },

        imageUrl: {
            type: String,
            required: [true, 'Webinar image URL is required'],
        },

        description: {
            type: String,
            default: '',
        },

        video: [
            {
                videoName: {
                    type: String,
                    required: [true, 'Video name is required'],
                },
                videoUrl: {
                    type: String,
                    required: [true, 'Video URL is required'],
                },
                videoDescription: {
                    type: String,
                    required: [true, 'Video description is required'],
                },
                videoImageUrl: { // NEW: Added videoImageUrl to the sub-document schema
                    type: String,
                    required: [true, 'Video image is required'],
                },
            },
        ],
    },
    { timestamps: true }
);

// Prevent model overwrite upon hot reloads
const Webinars =
    mongoose.models.Webinars ||
    mongoose.model<IWebinar>('Webinars', WebinarsSchema);

export default Webinars;