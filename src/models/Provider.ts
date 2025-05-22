import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';

interface ContactPerson {
  name: string;
  phoneNo: string;
  email: string;
}

interface AccountInfo {
  email: string;
  phoneNo: string;
}

export interface ProviderDocument extends Document {
  name: string;
  phoneNo: string;
  email: string;
  address: string;
  companyLogo?: string;
  zone: 'east' | 'west' | 'south' | 'north' | 'central'; // ✅ added zone
  module: mongoose.Types.ObjectId;
  identityType: 'passport' | 'driving license' | 'other';
  identityNumber: string;
  identificationImage: string;
  contactPerson: ContactPerson;
  accountInformation: AccountInfo;
  password: string;
  confirmPassword: string;
  addressLatitude: number;
  addressLongitude: number;
  setBusinessPlan: 'commission base' | 'other';
  isDeleted: boolean;
}

const providerSchema = new Schema<ProviderDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNo: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
  },
  zone: {
    type: String,
    enum: ['east', 'west', 'south', 'north', 'central'],
    required: true,
  },
  companyLogo: {
    type: String, // URL or path to the image
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  identityType: {
    type: String,
    enum: ['passport', 'driving license', 'other'],
    required: true,
  },
  identityNumber: {
    type: String,
    required: true,
  },
  identificationImage: {
    type: String, // URL or path to the image
    required: true,
  },
  contactPerson: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNo: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  accountInformation: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return v === this.email; // Must be same as main email
        },
        message: props => `${props.value} must be the same as provider email!`
      }
    },
    phoneNo: {
      type: String,
      required: true,
      trim: true,
    },
  },
  password: {
    type: String,
    required: true,
  },
  //   confirmPassword: {
  //     type: String,
  //     required: true,
  //     validate: {
  //       validator: function(v) {
  //         return v === this.password;
  //       },
  //       message: 'Passwords do not match!'
  //     }
  //   },
  addressLatitude: {
    type: Number,
    required: true,
  },
  addressLongitude: {
    type: Number,
    required: true,
  },
  setBusinessPlan: {
    type: String,
    enum: ['commission base', 'other'],
    // required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

providerSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
providerSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  return bcrypt.compare(candidatePassword, this.password);
};

// module.exports = mongoose.model('Provider', providerSchema);
export default mongoose.models.Provider || mongoose.model('Provider', providerSchema);
