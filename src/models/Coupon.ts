import { Schema, model, models, Document, Types } from 'mongoose';

/** ───────────────
 *  Type Definition
 *  ─────────────── */
export interface ICoupon extends Document {
  /* core */
  couponType: 'default' | 'firstBooking' | 'customerWise';
  couponCode: string;

  /* discount meta */
  discountType: 'Category Wise' | 'Service Wise' | 'Mixed';
  discountTitle: string;

  /* scope selectors (all optional except zone) */
  customer?: Types.ObjectId;
  category?: Types.ObjectId;
  service?: Types.ObjectId;
  zone: Types.ObjectId;

  /* amount */
  discountAmountType: 'Percentage' | 'Fixed Amount';
  amount: number;               // either % or ₹
  maxDiscount?: number;         // only for %
  minPurchase: number;          // order subtotal gate

  /* validity window */
  startDate: Date;
  endDate: Date;

  /* usage limits */
  limitPerUser: number;

  /* responsibility & audience */
  discountCostBearer: 'Admin' | 'Provider';
  couponAppliesTo: 'Growth Partner' | 'Customer';

  /* misc */
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** ───────────────
 *  Schema Definition
 *  ─────────────── */
const CouponSchema = new Schema<ICoupon>(
  {
    couponType: {
      type: String,
      enum: ['default', 'firstBooking', 'customerWise'],
      required: true,
    },
    couponCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    customer: { type: Schema.Types.ObjectId, ref: 'ServiceCustomer' },
    discountType: {
      type: String,
      enum: ['Category Wise', 'Service Wise', 'Mixed'],
      required: true,
    },
    discountTitle: { type: String, required: true, trim: true },

    /* selectors */
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    service: { type: Schema.Types.ObjectId, ref: 'Service' },
    zone: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },

    /* amount & limits */
    discountAmountType: {
      type: String,
      enum: ['Percentage', 'Fixed Amount'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    minPurchase: { type: Number, required: true, min: 0 },

    /* dates */
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    limitPerUser: { type: Number, required: true, min: 1 },

    /* ownership & audience */
    discountCostBearer: {
      type: String,
      enum: ['Admin', 'Provider'],
      required: true,
    },
    couponAppliesTo: {
      type: String,
      enum: ['Growth Partner', 'Customer'],
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    /* flags */
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/** ───────────────
 *  Indexes & Hooks
 *  ─────────────── */
// ensure coupon code uniqueness & fast look-ups
CouponSchema.index({ couponCode: 1 }, { unique: true });
// quick querying of currently valid coupons
CouponSchema.index({ startDate: 1, endDate: 1 });

/* optional: enforce maxDiscount only when amount type is % */
CouponSchema.pre('validate', function (next) {
  if (this.discountAmountType === 'Percentage' && this.maxDiscount == null) {
    this.invalidate(
      'maxDiscount',
      'maxDiscount is required when discountAmountType is "Percentage"'
    );
  }
  next();
});

export default models.Coupon || model<ICoupon>('Coupon', CouponSchema);
