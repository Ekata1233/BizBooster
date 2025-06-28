import mongoose from "mongoose";

const CommissionSchema = new mongoose.Schema({
  adminCommission: {
    type: Number,
  
  },
  platformFee: {
    type: Number,
   
  },
});

export default mongoose.models.Commission ||
  mongoose.model("Commission", CommissionSchema);
