import { NextRequest, NextResponse } from 'next/server';
import Checkout from '@/models/Checkout';
import { connectToDatabase } from '@/utils/db';

import "@/models/Coupon";
import "@/models/Service";
import "@/models/ServiceCustomer";
import "@/models/User";
import "@/models/Provider";
import mongoose from 'mongoose';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function PATCH(req: NextRequest) {
    await connectToDatabase();

    try {
        const url = new URL(req.url);
        const id = url.pathname.split("/").pop();

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid checkout ID" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Only cancel if it's NOT already canceled
        const updatedCheckout = await Checkout.findOneAndUpdate(
            { _id: id, isCanceled: false }, // condition
            { isCanceled: true, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedCheckout) {
            return NextResponse.json(
                { success: false, message: "Checkout not found or already canceled" },
                { status: 400, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { success: true, data: updatedCheckout },
            { status: 200, headers: corsHeaders }
        );

    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Unknown error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
