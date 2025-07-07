import mongoose, { Schema } from "mongoose";

const BusinessInformationSchema = new mongoose.Schema(
  {
    identityType: {
      type: String,
      enum: ['passport', 'driving_license', 'addharcard', 'pancard'],
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
    customId: { type: String, unique: true },
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNo: { type: String, required: true },
    generalImage: { type: String ,  required: true},
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

ServiceManSchema.pre("save", async function (next) {
  if (this.customId) return next(); // Already exists, skip

  console.log("proivder id : ", this.provider);
  const providerDoc = await mongoose.model("Provider").findById(this.provider);

 if (!providerDoc) {
    return next(new Error("Provider not found"));
  }

  // Use storeName if available, otherwise fallback to fullName
  let sourceName = providerDoc?.storeInfo?.storeName || providerDoc.fullName;

  if (!sourceName) {
    return next(new Error("Provider name or store name not found"));
  }

  const prefix = sourceName.trim().substring(0, 3).toLowerCase();

  const latestServiceMan = await mongoose.model("ServiceMan").findOne({
    customId: { $regex: `^${prefix}` },
  }).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (latestServiceMan && latestServiceMan.customId) {
    const numberPart = latestServiceMan.customId.slice(3);
    const parsedNumber = parseInt(numberPart, 10);
    if (!isNaN(parsedNumber)) {
      nextNumber = parsedNumber + 1;
    }
  }

  const paddedNumber = String(nextNumber).padStart(5, '0');
  this.customId = `${prefix}${paddedNumber}`;

  next();
});


export default mongoose.models.ServiceMan || mongoose.model("ServiceMan", ServiceManSchema);
