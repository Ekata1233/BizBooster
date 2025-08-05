import mongoose, { Schema, Document } from 'mongoose';



interface IAdvisor extends Document {
    name: string;
    imageUrl: string;
    rating: number;
    phoneNumber: number;
    language: string;
    tags: [string];
    chat: string;

   
}

const AdvisorSchema: Schema = new Schema<IAdvisor>(
    {
        name: {
            type: String,
            required: [true, 'Advisor name is required'],
            unique: true,
            trim: true,
        },

        imageUrl: {
            type: String,
            required: [true, 'IAdvisor image URL is required'],
        },

        rating: {
            type: Number,
             required: [true, 'rating is required'],
        },

        phoneNumber: {
            type: Number,
            required: [true, 'phoneNumber is required'],
        },

        language: {
            type: String,
             required: [true, 'language is required'],
        },

          tags: {
            type: [String],
            required: [true, 'tags are required'],
        },

        chat: {
            type: String,
             required: [true, 'chat is required'],
        }


      
    },
    { timestamps: true }
);


const Advisor =
    mongoose.models.Advisor ||
    mongoose.model<IAdvisor>('Advisor', AdvisorSchema);

export default Advisor;