// import mongoose, { Document, Schema } from 'mongoose';

// interface ICheckout extends Document {
//     bookingId: string;
//     user: mongoose.Types.ObjectId;
//     service: mongoose.Types.ObjectId;
//     serviceCustomer: mongoose.Types.ObjectId;
//     provider: mongoose.Types.ObjectId;
//     coupon?: mongoose.Types.ObjectId;
//     subtotal: number;
//     serviceDiscount: number;
//     couponDiscount: number;
//     champaignDiscount: number;
//     vat: number;
//     platformFee: number;
//     assurityfee: number;
//     tax: number;
//     totalAmount: number;
//     termsCondition: boolean;
//     paymentMethod: ('credit_card' | 'upi' | 'pac' | 'net_banking' | 'wallet' | 'debit_card')[];
//     walletAmount: number;
//     paidByOtherMethodAmount: number;
//     partialPaymentNow: number;
//     partialPaymentLater: number;
//     remainingPaymentStatus: 'pending' | 'paid' | 'failed';

//     paymentStatus: 'pending' | 'paid' | 'failed';
//     orderStatus: 'processing' | 'in_progress' | 'completed' | 'cancelled';
//     notes?: string;
//     isVerified: boolean;
//     isAccepted: boolean;
//     acceptedDate: Date;
//     serviceMan: mongoose.Types.ObjectId;
//     otp: string;
//     isOtpVerified: boolean;
//     isCompleted: boolean;
//     commissionDistributed: boolean;
//     isCanceled: boolean;
//     isDeleted: boolean;
//     createdAt: Date;
//     updatedAt: Date;
// }

// const checkoutSchema = new Schema<ICheckout>({
//     bookingId: { type: String, unique: true }, // Auto-generated Booking ID
//     user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
//     serviceCustomer: { type: Schema.Types.ObjectId, ref: 'ServiceCustomer', required: true },
//     provider: { type: Schema.Types.ObjectId, ref: 'Provider' },
//     coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', default: null },
//     subtotal: { type: Number, required: true, min: 0 },
//     serviceDiscount: { type: Number, required: true, min: 0, default: 0 },
//     couponDiscount: { type: Number, required: true, min: 0, default: 0 },
//     champaignDiscount: { type: Number, required: true, min: 0, default: 0 },
//     vat: { type: Number, required: true, min: 0, default: 0 },
//     platformFee: { type: Number, required: true, min: 0, default: 0 },
//     assurityfee: { type: Number, required: true, min: 0, default: 0 },
//     tax: { type: Number, required: true, min: 0, default: 0 },
//     termsCondition: { type: Boolean, default: false },
//     totalAmount: { type: Number, required: true, min: 0 },
//     paymentMethod: {
//         type: [String],
//         required: true,
//         enum: ['credit_card', 'upi', 'pac', 'net_banking', 'wallet','debit_card'],
//     },
//     walletAmount: { type: Number, default: 0, min: 0 },
//     paidByOtherMethodAmount: { type: Number, default: 0, min: 0 },
//     partialPaymentNow: { type: Number, default: 0, min: 0 },
//     partialPaymentLater: { type: Number, default: 0, min: 0 },
//     remainingPaymentStatus: {
//         type: String,
//         enum: ['pending', 'paid', 'failed'],
//         default: 'pending'
//     },

//     paymentStatus: {
//         type: String,
//         enum: ['pending', 'paid', 'failed'],
//         default: 'pending',
//     },
//     orderStatus: {
//         type: String,
//         enum: ['processing', 'in_progress', 'completed', 'cancelled'],
//         default: 'processing',
//     },
//     notes: { type: String, trim: true, default: '' },
//     isVerified: { type: Boolean, default: false },
//     isAccepted: { type: Boolean, default: false },
//     acceptedDate: { type: Date, default: null },
//     serviceMan: { type: Schema.Types.ObjectId, ref: 'ServiceMan', default: null },
//     otp: { type: String, unique: true },
//     isOtpVerified: { type: Boolean, default: false },
//     isCompleted: { type: Boolean, default: false },
//     commissionDistributed: { type: Boolean, default: false },
//     isCanceled: { type: Boolean, default: false },
//     isDeleted: { type: Boolean, default: false },
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now },
// });

// // Auto-generate bookingId like FTB000001, FTB000002, ...
// checkoutSchema.pre<ICheckout>('save', async function (next) {
//     if (!this.bookingId) {
//         const lastBooking = await mongoose
//             .model<ICheckout>('Checkout')
//             .findOne({})
//             .sort({ createdAt: -1 })
//             .select('bookingId');

//         let nextId = 1;
//         if (lastBooking?.bookingId) {
//             const numericPart = parseInt(lastBooking.bookingId.replace('FTB', ''), 10);
//             if (!isNaN(numericPart)) {
//                 nextId = numericPart + 1;
//             }
//         }

//         this.bookingId = `FTB${String(nextId).padStart(6, '0')}`;
//     }

//     if (!this.otp) {
//         let isUnique = false;
//         while (!isUnique) {
//             const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number
//             const existing = await mongoose.model<ICheckout>('Checkout').findOne({ otp: generatedOtp });
//             if (!existing) {
//                 this.otp = generatedOtp;
//                 isUnique = true;
//             }
//         }
//     }

//     this.updatedAt = new Date();
//     next();
// });

// const Checkout = mongoose.models.Checkout || mongoose.model<ICheckout>('Checkout', checkoutSchema);
// export default Checkout;


import mongoose, { Document, Schema } from 'mongoose';

interface ICheckout extends Document {
    bookingId: string;
    user: mongoose.Types.ObjectId;
    service: mongoose.Types.ObjectId;
    serviceCustomer: mongoose.Types.ObjectId;
    provider: mongoose.Types.ObjectId;
    serviceMan: mongoose.Types.ObjectId;
    coupon?: mongoose.Types.ObjectId;
    otp: string;

    subtotal: number;
    serviceDiscount: number;
    couponDiscount: number;
    champaignDiscount: number;
    gst: number;
    platformFee: number;
    assurityfee: number;

    listingPrice: Number;
    serviceDiscountPrice: Number;
    priceAfterDiscount: Number;
    couponDiscountPrice: Number;
    serviceGSTPrice: Number;
    platformFeePrice: Number;
    assurityChargesPrice: Number;


    totalAmount: number;


    paymentMethod: ('wallet' | 'pac' | 'cashfree')[];
    walletAmount: number;
    otherAmount: number;
    paidAmount: number;
    remainingAmount: number;
    isPartialPayment: boolean;

    cashfreeMethod?: 'credit_card' | 'upi' | 'net_banking' | 'debit_card';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'partial';
    orderStatus: 'processing' | 'in_progress' | 'completed' | 'cancelled';
    cashInHand?: boolean;
    cashInHandAmount?: number;
    notes?: string;
    termsCondition: boolean;
    isVerified: boolean;
    isAccepted: boolean;
    acceptedDate: Date;
    isOtpVerified: boolean;
    isCompleted: boolean;
    commissionDistributed: boolean;
    isCanceled: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const checkoutSchema = new Schema<ICheckout>({
    bookingId: { type: String, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    serviceCustomer: { type: Schema.Types.ObjectId, ref: 'ServiceCustomer', required: true },
    provider: { type: Schema.Types.ObjectId, ref: 'Provider' },
    serviceMan: { type: Schema.Types.ObjectId, ref: 'ServiceMan', default: null },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', default: null },
    otp: { type: String, unique: true },

    subtotal: { type: Number, required: true, min: 0 },
    serviceDiscount: { type: Number, required: true, min: 0, default: 0 },
    couponDiscount: { type: Number, required: true, min: 0, default: 0 },
    champaignDiscount: { type: Number, required: true, min: 0, default: 0 },
    gst: { type: Number, required: true, min: 0, default: 0 },
    platformFee: { type: Number, required: true, min: 0, default: 0 },
    assurityfee: { type: Number, required: true, min: 0, default: 0 },


    listingPrice: { type: Number},
    serviceDiscountPrice: { type: Number},
    priceAfterDiscount: { type: Number},
    couponDiscountPrice: { type: Number},
    serviceGSTPrice: { type: Number},
    platformFeePrice: { type: Number},
    assurityChargesPrice: { type: Number},


    totalAmount: { type: Number, required: true, min: 0 },


    paymentMethod: {
        type: [String],
        required: true,
        enum: ['wallet', 'pac', 'cashfree'],
    },

    walletAmount: { type: Number, default: 0, min: 0 },
    otherAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    isPartialPayment: { type: Boolean, default: false },
    remainingAmount: { type: Number, default: 0 },
    cashfreeMethod: {
        type: String,
        enum: ['credit_card', 'upi', 'net_banking', 'debit_card'],
        default: null,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'unpaid'],
        default: 'pending',
    },
    orderStatus: {
        type: String,
        enum: ['processing', 'in_progress', 'completed', 'cancelled'],
        default: 'processing',
    },
    cashInHand: { type: Boolean, default: false },
    cashInHandAmount: { type: Number, default: 0 },
    notes: { type: String, trim: true, default: '' },
    termsCondition: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isAccepted: { type: Boolean, default: false },
    acceptedDate: { type: Date, default: null },
    isOtpVerified: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    commissionDistributed: { type: Boolean, default: false },
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

    if (!this.otp) {
        let isUnique = false;
        while (!isUnique) {
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number
            const existing = await mongoose.model<ICheckout>('Checkout').findOne({ otp: generatedOtp });
            if (!existing) {
                this.otp = generatedOtp;
                isUnique = true;
            }
        }
    }

    this.updatedAt = new Date();
    next();
});

const Checkout = mongoose.models.Checkout || mongoose.model<ICheckout>('Checkout', checkoutSchema);
export default Checkout;
