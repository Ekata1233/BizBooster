import mongoose, { Schema } from 'mongoose';
// import { unique } from 'next/dist/build/utils';

const TutorialVideosSchema: Schema = new Schema({
   
    video : [{
        videoName:{type:String,required:true},
        videoUrl:{type:String,required:true},
        videoDescription:{type:String,required:true}
    }],
   
  
}, { timestamps: true });  

const TutorialVideos = mongoose.models.TutorialVideos || mongoose.model('TutorialVideos', TutorialVideosSchema);

export default TutorialVideos;