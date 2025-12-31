import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    serviceName: { 
  type: String, 
  required: [true, "Service name is required"] ,
  trim: true
},
category: { 
  type: mongoose.Schema.Types.ObjectId, 
  ref: "Category",
  required: [true, "Category is required"]
},
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

keyValues: [
  {
    key: {
      type: String,
      default: "",
      trim: true,
    },
    value: {
      type: String,
      default: "",
      trim: true,
    },
    icon: {
      type: String,
      default: "",
      trim: true,
    },
  },
],

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
    },
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
    {
      minDays: { type: Number, default: null },
      maxDays: { type: Number, default: null },
    },
  ],
  extraImages: [{ type: String }],

  // --------------------------------------------------
  // 🆕 EXTENDED SERVICE DETAILS
  // --------------------------------------------------

  operatingCities: [{ type: String }],

  brochureImage: [{ type: String }],

  emiavalable: [{ type: String }],

  counter: [
    {
      number: { type: Number },
      title: { type: String },
    },
  ],

  franchiseOperatingModel: [
    {
      info: { type: String },
      title: { type: String },
      description: { type: String },

      features: [
        {
          icon: { type: String },
          subtitle: { type: String },
          subDescription: { type: String },
        },
      ],

      tags: [{ type: String }],
      example: { type: String },
    },
  ],

  businessFundamental: {
    description: { type: String },
    points: [
      {
        subtitle: { type: String },
        subDescription: { type: String },
      },
    ],
  },

  keyAdvantages: [
    {
      icon: { type: String },
      title: { type: String },
      description: { type: String },
    },
  ],

  completeSupportSystem: [
    {
      icon: { type: String },
      title: { type: String },
      lists: [{ type: String }],
    },
  ],

  trainingDetails: [{ type: String }],

  agreementDetails: [{ type: String }],

  goodThings: [{ type: String }],

  compareAndChoose: [{ type: String }],

  companyDetails: [
    {
      name: { type: String },
      location: { type: String },
      details: [
        {
          title: { type: String },
          description: { type: String },
        },
      ],
    },
  ],

  roi: [{ type: String }],

  level: {
    type: String,
    enum: ["beginner", "medium", "advanced"],
    default: "beginner",
  },

  lessonCount: { type: Number, default: null },

  duration: {
    weeks: { type: Number, default: null },
    hours: { type: Number, default: null },
  },

  whatYouWillLearn: [{ type: String }],

  eligibleFor: [{ type: String }],

  courseCurriculum: [
    {
      title: { type: String },
      lists: [{ type: String }],
      model: [{ type: String }],
    },
  ],

  // ✅ NEW FIELD ADDED (as requested)
  courseIncludes: [{ type: String }],

  certificateImage: [{ type: String }],

  // ✅ UPDATED STRUCTURE (lists is STRING now)
  whomToSell: [
    {
      icon: { type: String },
      lists: { type: String },
    },
  ],

  include: [{ type: String }],

  notInclude: [{ type: String }],

  safetyAndAssurance: [{ type: String }],
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
    isTrending: { type: Boolean, default: false },
    isDeleted: { type: Boolean },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Service =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);

export default Service;
