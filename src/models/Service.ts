import mongoose from 'mongoose';


const serviceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  discountedPrice: {
    type: Number,
  },
  thumbnailImage: {
    type: String, // URL or path to image
    required: true
  },
  bannerImages: [{
    type: String // Array of URLs or image paths
  }],
  keyValues: [{
    key: { type: String, },
    value: { type: String }
  }],
  serviceDetails: {
    benefits: {
      type: String // HTML content from CKEditor
    },
    overview: {
      type: String
    },
    highlight: [{
      type: String // Array of URLs or image paths
    }],
    document: {
      type: String
    },
    whyChoose: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WhyChoose'
    }],
    howItWorks: {
      type: String
    },
    termsAndConditions: {
      type: String
    },
    faq: [{
      question: { type: String, required: true },
      answer: { type: String }
    }],
    extraSections: [{
      title: { type: String, required: true },
      description: { type: String }
    }]
  },
  franchiseDetails: {
    commission: {
      type: String // HTML content from CKEditor
    },
    overview: {
      type: String
    },
    howItWorks: {
      type: String
    },
    termsAndConditions: {
      type: String
    },
    extraSections: [{
      title: { type: String, required: true },
      description: { type: String }
    }]
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);
export default Service;