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
             min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
        },

        phoneNumber: {
            type: String, // ✅ CHANGE to String
      required: [true, 'Phone number is required'],
      match: [/^\d{10}$/, 'Phone number must be exactly 10 digits'],
        },

        language: {
            type: String,
             required: [true, 'language is required'],
        },

          tags: {
           type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one tag is required',
      },
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