// import mongoose, { Schema } from 'mongoose';
// export interface ILiveWebinar extends Document {
//   name: string;
//   imageUrl: string;
//   description: string;
//   displayVideoUrls: string[];
//   date: string;
//   startTime: string;
//   endTime: string;
//   user: mongoose.Types.ObjectId[];

// }

// const LiveWebinarsSchema: Schema = new Schema<ILiveWebinar>({
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

//     displayVideoUrls : {
//        type : [String],
//        default : [],
//     },
//     date: {
//         type: String,
//         required: [true, 'Date is required'],
//     },
//     startTime: {
//         type: String,
//         required: [true, 'Start time is required'],
//     },

//     endTime: {
//         type: String,
//         required: [true, 'End time is required'],
//     },
//     user: [{ type: Schema.Types.ObjectId, ref: "User" }],


    

// }, { timestamps: true }
// );

// const LiveWebinars = mongoose.models.LiveWebinars || mongoose.model('LiveWebinars', LiveWebinarsSchema);

// export default LiveWebinars;



import mongoose, { Schema } from 'mongoose';
export interface ILiveWebinar extends Document {
  name: string;
  imageUrl: string;
  description: string;
  displayVideoUrls: string[];
  date: string;
  startTime: string;
  endTime: string;
   user: {
    user: mongoose.Types.ObjectId;
    status: boolean;
  }[];

}

const LiveWebinarsSchema: Schema = new Schema<ILiveWebinar>({
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

    displayVideoUrls : {
       type : [String],
       default : [],
    },
    date: {
        type: String,
        required: [true, 'Date is required'],
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required'],
    },

    endTime: {
        type: String,
        required: [true, 'End time is required'],
    },
    // user: [{ type: Schema.Types.ObjectId, ref: "User" }],
    user: [
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: Boolean, default: false },
  }
]



    

}, { timestamps: true }
);

const LiveWebinars = mongoose.models.LiveWebinars || mongoose.model('LiveWebinars', LiveWebinarsSchema);

export default LiveWebinars;





