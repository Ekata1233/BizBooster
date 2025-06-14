import { NextRequest, NextResponse } from 'next/server';
import Wallet from '@/models/Wallet';
import { connectToDatabase } from '@/utils/db';
import "@/models/User";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ✅ POST: Create or update a Wallet
export async function POST(req: Request) {
    await connectToDatabase();

    try {
        const body = await req.json();
        const {
            userId,
            amount,
            type, // 'credit' or 'debit'
            description = '',
            referenceId = '',
            method = 'Wallet',
            status = 'success',
        } = body;

        // Validation
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: userId' },
                { status: 400, headers: corsHeaders }
            );
        }

        if (amount === undefined || amount === null) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: amount' },
                { status: 400, headers: corsHeaders }
            );
        }

        if (!type) {
            return NextResponse.json(
                { success: false, message: 'Missing required field: type (credit or debit)' },
                { status: 400, headers: corsHeaders }
            );
        }


        // Find wallet or create a new one
        let wallet = await Wallet.findOne({ userId });

        const transaction = {
            type,
            amount,
            description,
            referenceId,
            method,
            status,
            createdAt: new Date(),
        };

        if (!wallet) {
            // Create new wallet
            wallet = new Wallet({
                userId,
                balance: type === 'credit' ? amount : -amount,
                transactions: [transaction],
                totalCredits: type === 'credit' ? amount : 0,
                totalDebits: type === 'debit' ? amount : 0,
                lastTransactionAt: new Date(),
            });
        } else {
            // Update existing wallet
            wallet.transactions.push(transaction);
            wallet.lastTransactionAt = new Date();

            if (type === 'credit') {
                wallet.balance += amount;
                wallet.totalCredits += amount;
            } else if (type === 'debit') {
                if (wallet.balance < amount) {
                    return NextResponse.json(
                        { success: false, message: 'Insufficient wallet balance.' },
                        { status: 400, headers: corsHeaders }
                    );
                }
                wallet.balance -= amount;
                wallet.totalDebits += amount;
            }
        }

        await wallet.save();

        return NextResponse.json(
            { success: true, data: wallet },
            { status: 201, headers: corsHeaders }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { success: false, message },
            { status: 500, headers: corsHeaders }
        );
    }
}

// ✅ GET: Get Wallet by User ID
export async function GET(req: NextRequest) {
    await connectToDatabase();

    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('user');

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
