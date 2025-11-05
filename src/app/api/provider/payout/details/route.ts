import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Provider from '@/models/Provider';
import ProviderWallet from '@/models/ProviderWallet';
import ProviderBankDetails from '@/models/ProviderBankDetails';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ✅ Preflight handler
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ Main GET handler
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const sort = searchParams.get('sort');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const filter: Record<string, any> = {};

        // 🔍 Search filter
        if (search) {
            const regex = { $regex: search, $options: 'i' };
            filter.$or = [
                { 'storeInfo.storeName': regex },
                { 'storeInfo.storeEmail': regex },
                { phoneNo: regex },
                { email: regex },
            ];
        }

        // 🗓 Date filter
        if (startDate || endDate) {
            const dateFilter: { $gte?: Date; $lte?: Date } = {};
            if (startDate) dateFilter.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.$lte = end;
            }
            filter.createdAt = dateFilter;
        }

        // ↕ Sorting
        let sortOption: Record<string, 1 | -1> = {};
        switch (sort) {
            case 'latest':
                sortOption = { createdAt: -1 };
                break;
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            case 'ascending':
                sortOption = { 'storeInfo.storeName': 1 };
                break;
            case 'descending':
                sortOption = { 'storeInfo.storeName': -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        // 🧩 Fetch providers
        const providers = await Provider.find(filter)
            .sort(sortOption)
            .select('providerId storeInfo.storeName storeInfo.storePhone storeInfo.storeEmail storeInfo.logo email phoneNo')
            .lean();

        // ⚙️ Combine wallet + bank data
        const enrichedProviders = await Promise.all(
            providers.map(async (provider) => {
                const wallet = await ProviderWallet.findOne({ providerId: provider._id }).lean();
                const bank = await ProviderBankDetails.findOne({ providerId: provider._id }).lean();

                return {
                    providerId: provider.providerId,
                    storeName: provider.storeInfo?.storeName || '',
                    storePhone: provider.storeInfo?.storePhone || '',
                    storeEmail: provider.storeInfo?.storeEmail || '',
                    logo: provider.storeInfo?.logo || '',

                    // 💰 Wallet info
                    wallet: wallet
                        ? {
                            balance: wallet.balance,
                            upiId: wallet.upiId,
                            receivableBalance: wallet.receivableBalance,
                            withdrawableBalance: wallet.withdrawableBalance,
                            pendingWithdraw: wallet.pendingWithdraw,
                            alreadyWithdrawn: wallet.alreadyWithdrawn,
                            totalEarning: wallet.totalEarning,
                            totalCredits: wallet.totalCredits,
                            totalDebits: wallet.totalDebits,
                            cashInHand: wallet.cashInHand,
                            adjustmentCash: wallet.adjustmentCash,
                            isActive: wallet.isActive,
                        }
                        : null,

                    // 🏦 Bank info
                    bankDetails: bank
                        ? {
                            accountNumber: bank.accountNumber,
                            ifsc: bank.ifsc,
                            bankName: bank.bankName,
                            branchName: bank.branchName,
                            isActive: bank.isActive,
                        }
                        : null,
                };
            })
        );

        return NextResponse.json(
            {
                success: true,
                count: enrichedProviders.length,
                data: enrichedProviders,
            },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: any) {
        console.error('❌ Error fetching provider summary:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal Server Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
