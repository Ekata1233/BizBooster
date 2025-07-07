import mongoose, { Schema } from 'mongoose';

const CommissionSchema = new Schema({
  level1Commission: { type: Number, required: true },
  level2Commission: { type: Number, required: true },
}, {
  timestamps: true,
});

export const Commission = mongoose.models.Commission || mongoose.model('Commission', CommissionSchema);
