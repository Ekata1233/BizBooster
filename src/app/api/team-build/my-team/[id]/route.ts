// /api/team/earnings.ts

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';
import Checkout, { ICheckout } from '@/models/Checkout';
import Wallet, { IWallet, IWalletTransaction } from '@/models/Wallet';
import { connectToDatabase } from '@/utils/db';
import Lead from '@/models/Lead';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
export async function OPTIONS() {
    return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
export interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    phone: string;
    referralCode: string;
    referredBy?: string;
    // any other fields...
}

interface CommissionBreakdown {
    leadId: string;
    amount: number;
    description?: string;
}

interface TeamMemberSummary {
    user: IUser;
    totalEarningsFromThisUser: number;
    leads: ICheckout[];
    activeLeadCount: number;
    completeLeadCount: number;
    commissionBreakdown: CommissionBreakdown[];
    team: TeamMemberSummary[];
}

export async function GET(req: NextRequest) {
    await connectToDatabase();

    const url = new URL(req.url);
    const userId = url.pathname.split("/").pop();


    if (!userId) {
        return NextResponse.json(
            { success: false, message: 'userId is required' },
            { status: 400, headers: corsHeaders }
        );
    }

    try {
        const teamMembers = await User.find({ referredBy: userId });

        console.log("team members : ", teamMembers);

        const teamData = await Promise.all(
            teamMembers.map(async (member: any) => {
                const loggedInWallet = await Wallet.findOne({ userId });
                const earningsFromThisUser = loggedInWallet?.transactions.filter(
                    (tx: any) => tx.commissionFrom === member.userId
                );

                // 📦 Package commissions (Team Build Commission)
                const packageEarnings = loggedInWallet?.transactions.filter(
                    (tx: any) =>
                        tx.commissionFrom === member.userId &&
                        tx.source === "referral" &&
                        tx.description?.includes("Team Build Commission")
                ) || [];

                const formattedPackages = packageEarnings.map((pkg: any) => ({
                    referenceId: pkg.referenceId || "-",
                    description: pkg.description,
                    amount: pkg.amount,
                    date: pkg.createdAt,
                    status: pkg.status,
                    method: pkg.method,
                }));

                const totalEarningsFromShare_2 = earningsFromThisUser?.reduce((sum: number, tx: any) => {
                    return sum + (tx.amount || 0);
                }, 0) || 0;
                const leads = await Checkout.find({ user: member._id });

                const formattedLeads = leads.map((lead: any) => {
                    const commissionTx = loggedInWallet?.transactions.find(
                        (tx: any) => tx.leadId === lead.bookingId
                    );
                    return {
                        checkoutId: lead._id,
                        leadId: lead.bookingId,
                        status: lead.orderStatus,
                        amount: lead.totalAmount,
                        commissionEarned: commissionTx?.amount || 0
                    };
                });

                const activeLeadCount = leads.filter((lead: any) => !lead.isCompleted).length;
                const completeLeadCount = leads.filter((lead: any) => lead.isCompleted).length;


                // Step 3: Fetch 2nd-level team (under this member)
                const subTeam = await User.find({ referredBy: member._id });
                const activeTeamCount = subTeam.filter(sub => sub.packageActive === true).length;
                const inactiveTeamCount = subTeam.filter(sub => sub.packageActive !== true).length;


                const subTeamData = await Promise.all(
                    subTeam.map(async (sub: any) => {
                        const subLeads = await Checkout.find({ user: sub._id });
                        const subFormattedLeads = subLeads.map((lead: any) => {
                            const commissionTx = loggedInWallet?.transactions.find(
                                (tx: any) => tx.leadId === lead.bookingId
                            );
                            return {
                                checkoutId: lead._id,
                                leadId: lead.bookingId,
                                status: lead.orderStatus,
                                amount: lead.totalAmount,
                                commissionEarned: commissionTx?.amount || 0
                            };
                        });

                        const subActiveLeadCount = subLeads.filter((lead: any) => !lead.isCompleted).length;
                        const subCompleteLeadCount = subLeads.filter((lead: any) => lead.isCompleted).length;


                        const earningsFromThisSubUser = loggedInWallet?.transactions.filter(
                            (tx: any) => tx.commissionFrom === sub.userId
                        );
                        const totalEarningsFromShare_3 = earningsFromThisSubUser?.reduce(
                            (sum: number, tx: any) => sum + (tx.amount || 0),
                            0
                        ) || 0;

                        return {
                            user: sub,
                            totalEarningsFromShare_3,
                            leads: subFormattedLeads,
                            activeLeadCount: subActiveLeadCount,
                            completeLeadCount: subCompleteLeadCount
                        };
                    })
                );

                const totalEarningsFromSubTeam = subTeamData.reduce(
                    (sum, sub) => sum + (sub.totalEarningsFromShare_3 || 0),
                    0
                );
                return {
                    user: member,
                    totalEarningsFromShare_2: totalEarningsFromShare_2 + totalEarningsFromSubTeam,
                    leads: formattedLeads,
                    packages: formattedPackages,
                    activeLeadCount,
                    completeLeadCount,
                    activeTeamCount,
                    inactiveTeamCount,
                    team: subTeamData
                };
            })
        );

        return NextResponse.json(
            { success: true, team: teamData },
            { status: 200, headers: corsHeaders } // <-- add CORS headers here
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500, headers: corsHeaders });
    }
}