import { NextRequest, NextResponse } from 'next/server';
import Wallet from '@/models/Wallet';
import { connectToDatabase } from '@/utils/db';
import "@/models/User";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};


// ✅ GET: Get Wallet by User ID
export async function GET(req: NextRequest) {
    await connectToDatabase();

    try {
        const url = new URL(req.url);
        const userId = url.pathname.split("/").pop();


        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Missing user query parameter' },
                { status: 400, headers: corsHeaders }
            );
        }

        const wallet = await Wallet.findOne({ userId }).populate('userId');

        if (!wallet) {
            return NextResponse.json(
                { success: false, message: 'Wallet not found' },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { success: true, data: wallet },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { success: false, message },
            { status: 500, headers: corsHeaders }
        );
    }
}
