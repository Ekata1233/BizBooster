import mongoose, { Schema, Document, Model } from "mongoose";

export interface IServiceBase extends Document {
  moduleId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  subCategoryId?: mongoose.Types.ObjectId | null;
  serviceName: string;
  shortDescription?: string;
  bannerImage?: string;

  highlightImages?: string[];
  benefits?: string; // ⭐ updated (single string)
  aboutUs?: string;
  termsAndConditions?: string;
  whyChooseUs?: {
    icon: string;
    description: string;
  }[];
  howItWorks?: {
    icon: string;
    title: string;
    description1: string;
    description2: string;
  }[];
  assuredBy?: {
    icon?: string;
    title?: string;
    description?: string;
  };
  moreInfo?: {
    image: string;
    title: string;
    description: string;
  }[];
  faqs?: {
    question: string;
    answer: string;
  }[];
  serviceCommsion?: {
    commission: number;
  };

  rating: number;
  reviewsCount: number;
  isActive: boolean;
  serviceType: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceBaseSchema = new Schema<IServiceBase>(
  {
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
    },
    serviceName: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
    },
    bannerImage: {
      type: String,
    },

    highlightImages: [String],

    // ⭐ UPDATED FIELD
    benefits: {
      type: String,
    },

    aboutUs: String,

    termsAndConditions: String,

    whyChooseUs: [
      {
        icon: String,
        description: String,
      },
    ],

    howItWorks: [
      {
        icon: String,
        title: String,
        description1: String,
        description2: String,
      },
    ],

    assuredBy: {
      icon: String,
      title: String,
      description: String,
    },

    moreInfo: [
      {
        image: String,
        title: String,
        description: String,
      },
    ],

    faqs: [
      {
        question: String,
        answer: String,
      },
    ],

    serviceCommsion: {
      commission: { type: Number, default: 0 },
    },

    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "serviceType",
  }
);

const ServiceBase: Model<IServiceBase> =
  mongoose.models.ServiceBase ||
  mongoose.model<IServiceBase>("ServiceBase", ServiceBaseSchema);

export default ServiceBase;
