// import mongoose, { Schema } from 'mongoose';
// // import { unique } from 'next/dist/build/utils';

// const CertificationsSchema: Schema = new Schema({
//     name:{
//     type : String,
//     required : [true, 'Category name is required'],
//     unique : true,
//     trim : true
//     },

//     imageUrl:{
//         type : String,
//         required : [true, 'Category is URL is required'],
//     },
//     description : {
//        type : String,
//        default : "",
//     },
//     video : [{
//         videoName:{type:String,required:true},
//         videoUrl:{type:String,required:true},
//         videoDescription:{type:String,required:true}
//     }],
   
  
// }, { timestamps: true });  

// const Certifications = mongoose.models.Certifications || mongoose.model('Certifications', CertificationsSchema);

// export default Certifications;




import mongoose, { Schema, Document } from 'mongoose';

interface IVideo {
  videoName: string;
  videoUrl: string;
  videoDescription: string;
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
