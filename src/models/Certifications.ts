import mongoose, { Schema, Document } from 'mongoose';

interface IVideo {
    videoName: string;
    videoUrl: string;
    videoDescription: string;
    videoImageUrl: string; 
}

interface ICertification extends Document {
    name: string;
    imageUrl: string;
    description?: string;
    video: IVideo[];
}

const CertificationsSchema: Schema = new Schema<ICertification>(
    {
        name: {
            type: String,
            required: [true, 'Certification name is required'],
            unique: true,
            trim: true,
        },

        imageUrl: {
            type: String,
            required: [true, 'Certification image URL is required'],
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
const Certifications =
    mongoose.models.Certifications ||
    mongoose.model<ICertification>('Certifications', CertificationsSchema);

export default Certifications;