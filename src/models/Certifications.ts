import mongoose, { Schema } from 'mongoose';
// import { unique } from 'next/dist/build/utils';

const CertificationsSchema: Schema = new Schema({
    name:{
    type : String,
    required : [true, 'Category name is required'],
    unique : true,
    trim : true
    },

    imageUrl:{
        type : String,
        required : [true, 'Category is URL is required'],
    },
    description : {
       type : String,
       default : "",
    },
    video : [{
        videoName:{type:String,required:true},
        videoUrl:{type:String,required:true},
        videoDescription:{type:String,required:true}
    }],
   
  
}, { timestamps: true });  

const Certifications = mongoose.models.Certifications || mongoose.model('Certifications', CertificationsSchema);

export default Certifications;