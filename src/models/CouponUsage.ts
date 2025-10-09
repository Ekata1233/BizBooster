import { Schema, model, models, Types } from 'mongoose';

const CouponUsageSchema = new Schema({
  coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  usedCount: { type: Number, default: 0 },
});

export default models.CouponUsage || model('CouponUsage', CouponUsageSchema);
