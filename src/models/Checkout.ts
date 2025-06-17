import mongoose, { Document, Schema } from 'mongoose';

interface ICheckout extends Document {
    bookingId: string;
    user: mongoose.Types.ObjectId;
    service: mongoose.Types.ObjectId;
    serviceCustomer: mongoose.Types.ObjectId;
    provider: mongoose.Types.ObjectId;
    coupon?: mongoose.Types.ObjectId;
    subtotal: number;
    serviceDiscount: number;
    couponDiscount: number;
    champaignDiscount: number;
    vat: number;
    platformFee: number;
    garrentyFee: number;
    tax: number;
    totalAmount: number;
    termsCondition: boolean;
    paymentMethod: ('credit_card' | 'upi' | 'pac' | 'net_banking' | 'wallet')[];
    walletAmount: number;
    paidByOtherMethodAmount: number;
    partialPaymentNow: { type: Number, default: 0, min: 0 },
    partialPaymentLater: { type: Number, default: 0, min: 0 },
    remainingPaymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentStatus: 'pending' | 'paid' | 'failed';
    orderStatus: 'processing' | 'in_progress' | 'completed' | 'cancelled';
    notes?: string;
    isVerified: boolean;
    isAccepted: boolean;
    isCompleted: boolean;
    isCanceled: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const checkoutSchema = new Schema<ICheckout>({
    bookingId: { type: String, unique: true }, // Auto-generated Booking ID
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    serviceCustomer: { type: Schema.Types.ObjectId, ref: 'ServiceCustomer', required: true },
    provider: { type: Schema.Types.ObjectId, ref: 'Provider', default: null },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', default: null },
    subtotal: { type: Number, required: true, min: 0 },
    serviceDiscount: { type: Number, required: true, min: 0, default: 0 },
    couponDiscount: { type: Number, required: true, min: 0, default: 0 },
    champaignDiscount: { type: Number, required: true, min: 0, default: 0 },
    vat: { type: Number, required: true, min: 0, default: 0 },
    platformFee: { type: Number, required: true, min: 0, default: 0 },
    garrentyFee: { type: Number, required: true, min: 0, default: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    termsCondition: { type: Boolean, default: false },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
        type: [String],
        required: true,
        enum: ['credit_card', 'upi', 'pac', 'net_banking', 'wallet'],
    },
    walletAmount: { type: Number, default: 0, min: 0 },
    paidByOtherMethodAmount: { type: Number, default: 0, min: 0 },
    partialPaymentNow: { type: Number, default: 0, min: 0 },
    partialPaymentLater: { type: Number, default: 0, min: 0 },
    remainingPaymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
    },
    orderStatus: {
        type: String,
        enum: ['processing', 'in_progress', 'completed', 'cancelled'],
        default: 'processing',
    },
    notes: { type: String, trim: true, default: '' },
    isVerified: { type: Boolean, default: false },
    isAccepted: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    isCanceled: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Auto-generate bookingId like FTB000001, FTB000002, ...
checkoutSchema.pre<ICheckout>('save', async function (next) {
    if (!this.bookingId) {
        const lastBooking = await mongoose
            .model<ICheckout>('Checkout')
            .findOne({})
            .sort({ createdAt: -1 })
            .select('bookingId');

        let nextId = 1;
        if (lastBooking?.bookingId) {
            const numericPart = parseInt(lastBooking.bookingId.replace('FTB', ''), 10);
            if (!isNaN(numericPart)) {
                nextId = numericPart + 1;
            }
        }

        this.bookingId = `FTB${String(nextId).padStart(6, '0')}`;
    }

    this.updatedAt = new Date();
    next();
});

const Checkout = mongoose.models.Checkout || mongoose.model<ICheckout>('Checkout', checkoutSchema);
export default Checkout;
