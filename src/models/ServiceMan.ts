import mongoose, { Schema } from "mongoose";
import '@/models/Provider'

const BusinessInformationSchema = new mongoose.Schema(
  {
    identityType: {
      type: String,
      enum: ['Passport', 'Driving_license', 'Aadharcard', 'Pancard'],
      required: true,
    },
    identityNumber: {
      type: String,
      required: true,
      unique: true,
      validate: [
        {
          validator: function (value) {
            // Aadhaar: exactly 12 digits
            if (this.identityType === 'Aadharcard') {
              return /^\d{12}$/.test(value);
            }
            // PAN: 10 alphanumeric (common format)
            if (this.identityType === 'Pancard') {
              return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(value);
            }
            // Passport: 8 characters (1 letter + 7 digits)
            if (this.identityType === 'Passport') {
              return /^[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9]$/.test(value);
            }
            // Driving License: basic pattern (state code + RTO + number)
            if (this.identityType === 'Driving_license') {
              return /^[A-Z]{2}\d{2}\s?\d{11,13}$/.test(value);
            }
            return true;
          },
          message: function (props) {
            return `Invalid ${this.identityType} number format.`;
          },

        },
      ],
    },
    identityImage: {
      type: String,
    },
  },
  { _id: false }
);

const ServiceManSchema = new mongoose.Schema(
  {
    serviceManId: { type: String, unique: true },
    name: { type: String,
  required: true,
  trim: true,
  minlength: [4, "Name must be at least 4 characters long"],
  validate: {
    validator: function (v: string) {
      return /^[A-Za-z]+$/.test(v);
    },
    message: "Name must contain only alphabetic characters",
  }, },
    lastName: {  type: String,
  required: true,
  trim: true,
  minlength: [4, "Last name must be at least 4 characters long"],
  validate: {
    validator: function (v: string) {
      return /^[A-Za-z]+$/.test(v);
    },
    message: "Last name must contain only alphabetic characters",
  }, },
    phoneNo: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      validate: {
        validator: function (v) {
          // Indian mobile number format (10 digits, optional +91 or 0 prefix)
          return /^(\+91[\-\s]?)?[0]?(91)?[6-9]\d{9}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    generalImage: { type: String, required: true },
    businessInformation: {
      type: BusinessInformationSchema,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    password: { type: String, required: true },
    provider: { type: Schema.Types.ObjectId, ref: 'Provider' },

  },
  { timestamps: true }
);

ServiceManSchema.pre("save", async function (next) {
  if (this.serviceManId) return next(); // Already exists, skip

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
    serviceManId: { $regex: `^${prefix}` },
  }).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (latestServiceMan && latestServiceMan.serviceManId) {
    const numberPart = latestServiceMan.serviceManId.slice(3);
    const parsedNumber = parseInt(numberPart, 10);
    if (!isNaN(parsedNumber)) {
      nextNumber = parsedNumber + 1;
    }
  }

  const paddedNumber = String(nextNumber).padStart(5, '0');
  this.serviceManId = `${prefix}${paddedNumber}`;

  next();
});


export default mongoose.models.ServiceMan || mongoose.model("ServiceMan", ServiceManSchema);
