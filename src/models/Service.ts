import mongoose from 'mongoose';

const extraSectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
}, { _id: false });

const serviceDetailsSchema = new mongoose.Schema({
 
  highlight: String,
  document: String,
  whyChoose: String,
  howItWorks: String,
  termsAndConditions: String,
  faq: String,
  extraSections: [extraSectionSchema],
}, { _id: false });

const franchiseDetailsSchema = new mongoose.Schema({
  commission: String,
  overview: String,
  howItWorks: String,
  termsAndConditions: String,
  extraSections: [extraSectionSchema],
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },
  price: { type: Number, required: true },
  thumbnailImage: { type: String, required: true },
  bannerImages: [String],
  serviceDetails: serviceDetailsSchema,
  franchiseDetails: franchiseDetailsSchema,
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true
});

export default mongoose.models.Service || mongoose.model('Service', serviceSchema);
