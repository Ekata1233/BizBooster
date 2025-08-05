import mongoose, { Schema, Document } from 'mongoose';

export interface OfferDoc extends Document {
  bannerImage: string;
  thumbnailImage: string;
  offerStartTime: Date;
  offerEndTime: Date;
  galleryImages: string[];
  eligibilityCriteria: string;
  howToParticipate: string;
  faq: { question: string; answer: string }[];
  termsAndConditions: string;
  service: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSubSchema = new Schema(
  {
    question: { type: String, required: true },
    answer:   { type: String, required: true },
  },
  { _id: false } // no per-FAQ _ids unless you need them
);

const OfferSchema = new Schema<OfferDoc>(
  {
    bannerImage: { type: String, required: true, trim: true },
    thumbnailImage: { type: String, required: true, trim: true },
    offerStartTime: { type: Date, required: true, index: true },
    offerEndTime:   { type: Date, required: true, index: true },
    galleryImages:  { type: [String], default: [] },

    eligibilityCriteria:   { type: String, required: true },
    howToParticipate:      { type: String, required: true, },
    faq:                   { type: [FAQSubSchema], required: true, },  // <-- use sub-schema
    termsAndConditions:    { type: String, required: true },

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
