import mongoose, { Document, Schema } from 'mongoose';

export interface IProviderHelpAndSupport extends Document {
    email: string,
    call: string;
    whatsapp: string;
    createdAt: Date;
    updatedAt: Date; 
}

const ProviderHelpAndSupportSchema: Schema = new mongoose.Schema(
    {

        email: {
            type: String,
            required: true,

        },
        call: {
            type: String,
            required: true,

        },
        whatsapp: {
            type: String,
            required: true,

        },
    },
    { timestamps: true }
);

const ProviderHelpAndSupport =
    mongoose.models.ProviderHelpAndSupport ||
    mongoose.model<IProviderHelpAndSupport>('ProviderHelpAndSupport', ProviderHelpAndSupportSchema);

export default ProviderHelpAndSupport;
