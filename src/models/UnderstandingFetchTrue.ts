import mongoose from 'mongoose';


const underStandingFetchTrueSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    match: [/^[A-Za-z]+(?: [A-Za-z]+)*$/, 'Full name must be 2-30 alphabetic characters and may include spaces'],
    minlength: 2,
    maxlength: 30
  },
  videoUrl:{type:String,required:true},
})



const UnderStandingFetchTrue = mongoose.models.UnderStandingFetchTrue || mongoose.model('UnderStandingFetchTrue', underStandingFetchTrueSchema);

export default UnderStandingFetchTrue;