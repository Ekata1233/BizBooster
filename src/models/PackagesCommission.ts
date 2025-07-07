import mongoose, { Schema } from 'mongoose';

const PackagesCommissionSchema = new Schema({
  level1Commission: { type: Number, required: true },
  level2Commission: { type: Number, required: true },
}, {
  timestamps: true,
});

export const PackagesCommission =
  mongoose.models.PackagesCommission || mongoose.model('PackagesCommission', PackagesCommissionSchema);
