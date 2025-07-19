// models/Offer.ts
import mongoose, { Schema, Document, } from 'mongoose';

export interface OfferDoc extends Document {
    bannerImage: string;                 // URL or /uploads path
    offerStartTime: Date;
    offerEndTime: Date;
    galleryImages: string[];             // additional images
    eligibilityCriteria: string;         // CKEditor HTML
    howToParticipate: string;            // CKEditor HTML
    faq: string[];                         // CKEditor HTML (full FAQ block)
    termsAndConditions: string;          // CKEditor HTML
    isActive: boolean;                   // virtual
    createdAt: Date;
    updatedAt: Date;
}

const OfferSchema = new Schema<OfferDoc>(
    {
        bannerImage: {
            type: String,
            required: true,
            trim: true,
        },
        offerStartTime: {
            type: Date,
            required: true,
            index: true,
        },
        offerEndTime: {
            type: Date,
            required: true,
            index: true,
        },
        galleryImages: {
            type: [String],
            default: [],
        },
        eligibilityCriteria: {
            type: String, // store CKEditor HTML
            default: '',
        },
        howToParticipate: {
            type: String, // store CKEditor HTML
            default: '',
        },
        faq: [
            {
                question: { type: String, required: true },
                answer: { type: String, required: true }
            }
        ],

    termsAndConditions: {
            type: String, // store CKEditor HTML
            default: '',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
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

// Virtual: is offer currently active?
OfferSchema.virtual('isActive').get(function (this: OfferDoc) {
    const now = new Date();
    return now >= this.offerStartTime && now <= this.offerEndTime;
});

const Offer =
    mongoose.models.Offer || mongoose.model<OfferDoc>('Offer', OfferSchema);

export default Offer;