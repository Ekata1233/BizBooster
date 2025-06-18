import mongoose, { Schema } from "mongoose";

const BusinessInformationSchema = new mongoose.Schema(
  {
    identityType: {
      type: String,
      enum: ['passport', 'driving_license', 'nid', 'trade_license'],
      required: true,
    },
    identityNumber: {
      type: String,
      required: true,
    },
    identityImage: {
      type: String,
    },
  },
  { _id: false }
);

const ServiceManSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNo: { type: String, required: true },
    generalImage: { type: String },
    businessInformation: {
      type: BusinessInformationSchema,
      required: true,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    provider: { type: Schema.Types.ObjectId, ref: 'Provider' },

  },
  { timestamps: true }
);

export default mongoose.models.ServiceMan || mongoose.model("ServiceMan", ServiceManSchema);
