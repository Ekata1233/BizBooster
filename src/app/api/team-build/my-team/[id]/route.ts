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

    console.log("user I d;", userId)

    if (!userId) {
        return NextResponse.json(
            { success: false, message: 'userId is required' },
            { status: 400 }
        );
    }

    //     try {
    //         const wallet: IWallet | null = await Wallet.findOne({ userId }).lean<IWallet>();
    //         const walletTransactions: IWalletTransaction[] = wallet?.transactions || [];

    //         const level1Users: IUser[] = await User.find({ referredBy: userId }).lean<IUser[]>();

    //         const level1Details: TeamMemberSummary[] = await Promise.all(
    //             level1Users.map(async (level1User) => {
    //                 const level1UserId = String(level1User._id);

    //                 const leads: ICheckout[] = await Checkout.find({ user: level1UserId }) as ICheckout[];
    //                 const activeLeads = leads.filter((lead) => !lead.isCompleted);
    //                 const completeLeads = leads.filter((lead) => lead.isCompleted);

    //                 const transactionsFromB = walletTransactions.filter(
    //                     (tx) =>
    //                         tx.commissionFrom === level1UserId && tx.source === 'referral'
    //                 );

    //                 const totalEarnings = transactionsFromB.reduce(
    //                     (sum, tx) => sum + tx.amount,
    //                     0
    //                 );

    //                 const level2Users: IUser[] = await User.find({
    //                     referredBy: level1UserId,
    //                 }).lean<IUser[]>();

    //                 const level2Details: TeamMemberSummary[] = await Promise.all(
    //                     level2Users.map(async (level2User) => {
    //                         const level2UserId = String(level2User._id);
    //                         const leadsC: ICheckout[] = await Checkout.find({
    //                             user: level2UserId,
    //                         }) as ICheckout[];
    //                         const activeLeadsC = leadsC.filter((lead) => !lead.isCompleted);
    //                         const completeLeadsC = leadsC.filter((lead) => lead.isCompleted);

    //                         const transactionsFromC = walletTransactions.filter(
    //                             (tx) =>
    //                                 tx.commissionFrom === level2UserId &&
    //                                 tx.source === 'referral'
    //                         );

    //                         const earningsFromLevel2 = transactionsFromC.reduce(
    //                             (sum, tx) => sum + tx.amount,
    //                             0
    //                         );

    //                         return {
    //                             user: level2User,
    //                             totalEarningsFromThisUser: earningsFromLevel2,
    //                             leads: leadsC,
    //                             activeLeadCount: activeLeadsC.length,
    //                             completeLeadCount: completeLeadsC.length,
    //                             commissionBreakdown: transactionsFromC.map((tx) => ({
    //                                 leadId: tx.leadId,
    //                                 amount: tx.amount,
    //                                 description: tx.description,
    //                             })),
    //                             team: [],
    //                         };
    //                     })
    //                 );

    //                 return {
    //                     user: level1User,
    //                     totalEarningsFromThisUser: totalEarnings,
    //                     leads,
    //                     activeLeadCount: activeLeads.length,
    //                     completeLeadCount: completeLeads.length,
    //                     commissionBreakdown: transactionsFromB.map((tx) => ({
    //                         leadId: tx.leadId,
    //                         amount: tx.amount,
    //                         description: tx.description,
    //                     })),
    //                     team: level2Details,
    //                 };
    //             })
    //         );

    //         return NextResponse.json({ success: true, team: level1Details });
    //     } catch (error) {
    //         console.error(error);
    //         return NextResponse.json(
    //             { success: false, message: 'Server error' },
    //             { status: 500 }
    //         );
    //     }
    // }



    try {
        // Step 1: Find direct team (1st level)
        const teamMembers = await User.find({ referredBy: userId });

        const teamData = await Promise.all(
            teamMembers.map(async (member: any) => {
                // Find wallet of the logged-in user to check for referral earnings from this member
                const loggedInWallet = await Wallet.findOne({ userId });

                // Filter transactions where commissionFrom is this team member
                const earningsFromThisUser = loggedInWallet?.transactions.filter(
                    (tx: any) => tx.commissionFrom === member.userId
                );

                // Calculate total earnings from this team member
                const totalEarningsFromShare_2 = earningsFromThisUser?.reduce((sum: number, tx: any) => {
                    return sum + (tx.amount || 0);
                }, 0) || 0;

                // Step 2: Fetch leads generated by this team member
                const leads = await Checkout.find({ user: member._id });

                const formattedLeads = leads.map((lead: any) => {
                    const commissionTx = loggedInWallet?.transactions.find(
                        (tx: any) => tx.leadId === lead.bookingId
                    );
                    return {
                        leadId: lead.bookingId,
                        status: lead.orderStatus,
                        amount: lead.totalAmount,
                        commissionEarned: commissionTx?.amount || 0
                    };
                });

                // const activeLeadCount = leads.filter((lead: any) => lead.orderStatus === "active").length;
                // const completeLeadCount = leads.filter((lead: any) => lead.orderStatus === "complete").length;

                const activeLeadCount = leads.filter((lead: any) => !lead.isCompleted).length;
                const completeLeadCount = leads.filter((lead: any) => lead.isCompleted).length;


                // Step 3: Fetch 2nd-level team (under this member)
                const subTeam = await User.find({ referredBy: member._id });

                const subTeamData = await Promise.all(
                    subTeam.map(async (sub: any) => {
                        const subLeads = await Checkout.find({ user: sub._id });
                        const subFormattedLeads = subLeads.map((lead: any) => {
                            const commissionTx = loggedInWallet?.transactions.find(
                                (tx: any) => tx.leadId === lead.bookingId
                            );
                            return {
                                leadId: lead.bookingId,
                                status: lead.orderStatus,
                                amount: lead.totalAmount,
                                commissionEarned: commissionTx?.amount || 0
                            };
                        });

                        // const subActiveLeadCount = subLeads.filter((lead: any) => lead.orderStatus === "active").length;
                        // const subCompleteLeadCount = subLeads.filter((lead: any) => lead.orderStatus === "complete").length;

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
                            // totalEarningsFromShare: totalEarningsFromThisSubUser,
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
                    activeLeadCount,
                    completeLeadCount,
                    team: subTeamData
                };
            })
        );

        return NextResponse.json({ success: true, team: teamData });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}