import mongoose, { Document, Schema } from 'mongoose';

export type SelectionType = 'category' | 'subcategory' | 'service' | 'referralUrl';
export type PageType = 'home' | 'category'|'academy';

export interface IBanner extends Document {
  page: PageType;
  selectionType: SelectionType;
  screenCategory? : mongoose.Types.ObjectId;
  module?: mongoose.Types.ObjectId;
  category?: mongoose.Types.ObjectId;
  subcategory?: mongoose.Types.ObjectId;
  service?: mongoose.Types.ObjectId;
  referralUrl?: string;
  file: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    page: {
      type: String,
      enum: ['home', 'category','academy'],
      required: true,
    },
    screenCategory:{
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    selectionType: {
      type: String,
      enum: ['category', 'subcategory', 'service', 'referralUrl'],
      required: true,
    },
    module: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: function (this: IBanner) {
        return this.selectionType === 'category';
      },
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: 'Subcategory',
      required: function (this: IBanner) {
        return this.selectionType === 'subcategory';
      },
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: function (this: IBanner) {
        return this.selectionType === 'service';
      },
    },
    referralUrl: {
      type: String,
      required: function (this: IBanner) {
        return this.selectionType === 'referralUrl';
      },
    },
    file: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);
