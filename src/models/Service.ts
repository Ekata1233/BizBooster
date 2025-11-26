import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    serviceName: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },

    price: { type: Number, default: null },
    discount: { type: Number, default: null },
    gst: { type: Number, default: null },
    includeGst: { type: Boolean, default: false },
    gstInRupees: { type: Number, default: null },
    totalWithGst: { type: Number, default: null },
    discountedPrice: { type: Number, default: null },

    providerPrices: [
      {
        provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider" },
        providerMRP: { type: String },
        providerDiscount: { type: String },
        providerPrice: { type: Number, default: null },
        providerCommission: { type: String },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
        },
      },
    ],

    thumbnailImage: { type: String },
    bannerImages: [{ type: String }],
    tags: { type: [String], default: [] },

    keyValues: [{ key: String, value: String }],

    // --------------------------------------------------
    // SERVICE DETAILS
    // --------------------------------------------------
    serviceDetails: {
      benefits: [{ type: String }],
      aboutUs: [{ type: String }],
      highlight: [{ type: String }],
      document: [{ type: String }],

      assuredByFetchTrue: [
        { title: String, icon: String, description: String },
      ],

      howItWorks: [
        { title: String, icon: String, description: String },
      ],

      termsAndConditions: [{ type: String }],
      faq: [{ question: String, answer: String }],

      extraSections: [
        {
          title: { type: String },

          subtitle: [{ type: String }],
          image: [{ type: String }],
          description: [{ type: String }],
          subDescription: [{ type: String }],
          lists: [{ type: String }],
          tags: [{ type: String }],
        }
      ],

      whyChooseUs: [
        { title: String, icon: String, description: String },
      ],

      packages: [
        {
          name: String,
          price: { type: Number, default: null },
          discount: { type: Number, default: null },
          discountedPrice: { type: Number, default: null },
          whatYouGet: [String],
        },
      ],

      weRequired: [{ title: String, description: String }],
      weDeliver: [{ title: String, description: String }],

      moreInfo: [
        { title: String, image: String, description: String },
      ],

      connectWith: [
        { name: String, mobileNo: String, email: String },
      ],

      timeRequired: [
        { minDays: { type: Number, default: null }, maxDays: { type: Number, default: null } },
      ],

      extraImages: [{ type: String }],
    },

    // --------------------------------------------------
    // FRANCHISE DETAILS
    // --------------------------------------------------
    franchiseDetails: {
      commission: { type: String },
      termsAndConditions: { type: String },

      investmentRange: [
        {
          minRange: { type: Number, default: null },
          maxRange: { type: Number, default: null },
        },
      ],

      monthlyEarnPotential: [
        {
          minEarn: { type: Number, default: null },
          maxEarn: { type: Number, default: null },
        },
      ],

      franchiseModel: [
        {
          title: String,
          agreement: String,
          price: { type: Number, default: null },
          discount: { type: Number, default: null },
          gst: { type: Number, default: null },
          fees: { type: Number, default: null },
        },
      ],

      extraSections: [
        {
          title: { type: String },

          subtitle: [{ type: String }],
          image: [{ type: String }],
          description: [{ type: String }],
          subDescription: [{ type: String }],
          lists: [{ type: String }],
          tags: [{ type: String }],
        }
      ],

      extraImages: [{ type: String }],
    },

    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    recommendedServices: { type: Boolean, default: false },
    isDeleted: { type: Boolean },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Service =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);

export default Service;
