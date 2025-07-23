// // models/Offer.ts
// import mongoose, { Schema, Document, } from 'mongoose';

// export interface OfferDoc extends Document {
//     bannerImage: string;                 // URL or /uploads path
//     offerStartTime: Date;
//     offerEndTime: Date;
//     galleryImages: string[];             // additional images
//     eligibilityCriteria?: string;         // CKEditor HTML
//     howToParticipate?: string;            // CKEditor HTML
//     faq?: string[];                         // CKEditor HTML (full FAQ block)
//     termsAndConditions?: string;          // CKEditor HTML
//     service: mongoose.Types.ObjectId;    // CKEditor HTML
//     isActive: boolean;                   // virtual
//     createdAt: Date;
//     updatedAt: Date;
// }

// const OfferSchema = new Schema<OfferDoc>(
//     {
//         bannerImage: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         offerStartTime: {
//             type: Date,
//             required: true,
//             index: true,
//         },
//         offerEndTime: {
//             type: Date,
//             required: true,
//             index: true,
//         },
//         galleryImages: {
//             type: [String],
//             default: [],
//         },
//         eligibilityCriteria: {
//             type: String, // store CKEditor HTML
//             default: '',
//         },
//         howToParticipate: {
//             type: String, // store CKEditor HTML
//             default: '',
//         },
//         faq: [
//             {
//                 question: { type: String,  default: '', },
//                 answer: { type: String,  default: '', }
//             }
//         ],

//     termsAndConditions: {
//             type: String, // store CKEditor HTML
//             default: '',
//         },
//         service: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Service',
//             required: true,
//         }
//     },
//     {
//         timestamps: true,
//         toJSON: { virtuals: true },
//         toObject: { virtuals: true },
//     }
// );

// // Validate start < end
// OfferSchema.pre('validate', function (next) {
//     if (this.offerEndTime && this.offerStartTime && this.offerEndTime <= this.offerStartTime) {
//         return next(new Error('offerEndTime must be after offerStartTime.'));
//     }
//     next();
// });

// // Virtual: is offer currently active?
// OfferSchema.virtual('isActive').get(function (this: OfferDoc) {
//     const now = new Date();
//     return now >= this.offerStartTime && now <= this.offerEndTime;
// });

// const Offer =
//     mongoose.models.Offer || mongoose.model<OfferDoc>('Offer', OfferSchema);

// export default Offer;


// models/Offer.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface OfferDoc extends Document {
  bannerImage: string;
  offerStartTime: Date;
  offerEndTime: Date;
  galleryImages: string[];
  eligibilityCriteria?: string;
  howToParticipate?: string;
  faq?: { question: string; answer: string }[];  // reflect subdoc shape
  termsAndConditions?: string;
  service: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSubSchema = new Schema(
  {
    question: { type: String, default: '' },  // <-- not required
    answer:   { type: String, default: '' },  // <-- not required
  },
  { _id: false } // no per-FAQ _ids unless you need them
);

const OfferSchema = new Schema<OfferDoc>(
  {
    bannerImage: { type: String, required: true, trim: true },
    offerStartTime: { type: Date, required: true, index: true },
    offerEndTime:   { type: Date, required: true, index: true },
    galleryImages:  { type: [String], default: [] },

    eligibilityCriteria:   { type: String, default: '' },
    howToParticipate:      { type: String, default: '' },
    faq:                   { type: [FAQSubSchema], default: [] },  // <-- use sub-schema
    termsAndConditions:    { type: String, default: '' },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Validate start < end
OfferSchema.pre('validate', function (next) {
  if (this.offerEndTime && this.offerStartTime && this.offerEndTime <= this.offerStartTime) {
    return next(new Error('offerEndTime must be after offerStartTime.'));
  }
  next();
});

// Virtual
OfferSchema.virtual('isActive').get(function (this: OfferDoc) {
  const now = new Date();
  return now >= this.offerStartTime && now <= this.offerEndTime;
});

const Offer = mongoose.models.Offer || mongoose.model<OfferDoc>('Offer', OfferSchema);
export default Offer;
