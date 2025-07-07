import mongoose, { Schema } from 'mongoose';
// import { unique } from 'next/dist/build/utils';

const WebinarsSchema: Schema = new Schema({
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

const Webinars = mongoose.models.Webinars || mongoose.model('Webinars', WebinarsSchema);

export default Webinars;