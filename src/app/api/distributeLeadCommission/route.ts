
import { NextResponse } from "next/server";
import { Types } from "mongoose";// adjust this path if needed
import Checkout from "@/models/Checkout";
import ReferralCommission from "@/models/ReferralCommission";
import User from "@/models/User";
import "@/models/Service";
import Wallet from "@/models/Wallet";
import { connectToDatabase } from "@/utils/db";
import ProviderWallet from "@/models/ProviderWallet";
import Lead from "@/models/Lead";
import AdminEarnings from "@/models/AdminEarnings";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// Replace this with your admin ID or logic
const ADMIN_ID = new Types.ObjectId("444c44d4444be444d4444444");

export async function POST(req: Request) {
    await connectToDatabase();

    try {
        const body = await req.json();
        const { checkoutId } = body;

        if (!checkoutId) {
            return NextResponse.json(
                { success: false, message: "Missing checkoutId." },
                { status: 400, headers: corsHeaders }
            );
        }
        const lead = await Lead.findOne({ checkout: checkoutId })
        // console.log("lead : ", lead)

        const checkout = await Checkout.findById(checkoutId).populate("user").populate({
            path: "service",
            select: "franchiseDetails.commission"
        });

        console.log("checkout details in commission distribute :", checkout);

        // const commission = lead?.newCommission ?? checkout.service?.franchiseDetails?.commission;


        const rawCommission = checkout.service?.franchiseDetails?.commission;

        // ✅ CORRECT fallback logic
        const commission =
            lead?.newCommission || lead?.newCommission === 0
                ? lead?.newCommission > 0
                    ? lead.newCommission
                    : rawCommission
                : rawCommission;




        if (!checkout || checkout.commissionDistributed) {
            return NextResponse.json(
                { success: false, message: "commission already distributed." },
                { status: 400, headers: corsHeaders }
            );
        }

        // const leadAmount = lead?.afterDicountAmount ?? checkout.totalAmount;
        const leadAmount = lead?.afterDicountAmount ?? checkout.subtotal;


        console.log("lead amount : ", leadAmount);

        const extraLeadAmount = Array.isArray(lead?.extraService)
            ? lead.extraService.reduce((sum: number, item: { total?: number }) => sum + (item.total || 0), 0)
            : 0;

        const extraCommission = Array.isArray(lead?.extraService) && lead?.extraService.length > 0
            ? (lead?.extraService[0]?.commission) || 0
            : 0;

        const userC = checkout.user;


        const userB = userC.referredBy
            ? await User.findById(userC.referredBy)
            : null;


        const userA = userB?.referredBy
            ? await User.findById(userB.referredBy)
            : null;

        let commissionPool = 0;
        let providerShare = 0;

        if (typeof commission === "string") {
            const trimmed = commission.trim();

            console.log("commission after trimmed : ", trimmed);

            if (trimmed.endsWith("%")) {
                const percent = parseFloat(trimmed.replace("%", ""));
                commissionPool = (leadAmount * percent) / 100;
                console.log("commission pool : ", commissionPool);
            } else if (/^₹?\d+(\.\d+)?$/.test(trimmed)) {
                const numericString = trimmed.replace("₹", "").trim();
                commissionPool = parseFloat(numericString);
                console.log("commission pool : ", commissionPool);
            } else {
                throw new Error("Invalid commission format. Must be a percentage (e.g. '30%') or a fixed amount like '₹2000' or '2000'.");
            }

            providerShare = leadAmount - commissionPool;
        } else if (typeof commission === "number") {
            commissionPool = commission;
            providerShare = leadAmount - commissionPool;
        } else {
            throw new Error("Invalid commission format. Must be a percentage (e.g. '30%') or a fixed number.");
        }


        const C_share = commissionPool * 0.5;
        const B_share = commissionPool * 0.2;
        const A_share = commissionPool * 0.1;
        let adminShare = commissionPool * 0.2;

        console.log("commission commission : ", commissionPool);
        console.log("proivder commission : ", providerShare);
        console.log("C_share commission : ", C_share);
        console.log("B_share commission : ", B_share);
        console.log("A_share commission : ", A_share);
        console.log("adminShare commission : ", adminShare);

        if (!userB) adminShare += B_share;
        if (!userA) adminShare += A_share;

        // const creditWallet = async (
        //     userId: Types.ObjectId,
        //     amount: number,
        //     description: string,
        //     referenceId?: string
        // ) => {
        //     const wallet = await Wallet.findOne({ userId });
        //     if (!wallet) throw new Error(`Wallet not found for user ${userId}`);

        //     wallet.balance += amount;
        //     wallet.totalCredits += amount;
        //     wallet.lastTransactionAt = new Date();
        //     wallet.transactions.push({
        //         type: "credit",
        //         amount,
        //         description,
        //         referenceId,
        //         method: "Wallet",
        //         source: "referral",
        //         status: "success",
        //         createdAt: new Date(),
        //     });

        //     await wallet.save();
        // };

        const creditWallet = async (
            userId: Types.ObjectId,
            amount: number,
            description: string,
            referenceId?: string,
            level?: "A" | "B" | "C",
            leadId?: string,
            commissionFrom?: string
        ) => {
            let wallet = await Wallet.findOne({ userId });

            const transaction = {
                type: "credit",
                amount,
                description,
                referenceId,
                method: "Wallet",
                source: "referral",
                status: "success",
                createdAt: new Date(),
                balanceAfterTransaction: 0,
                leadId,
                commissionFrom
            };

            if (!wallet) {
                wallet = new Wallet({
                    userId,
                    balance: amount,
                    totalCredits: amount,
                    totalDebits: 0,
                    selfEarnings: level === "C" ? amount : 0,
                    referralEarnings: level === "A" || level === "B" ? amount : 0,
                    transactions: [transaction],
                    lastTransactionAt: new Date(),
                });
            } else {
                wallet.balance += amount;
                wallet.totalCredits += amount;
                wallet.lastTransactionAt = new Date();
                if (level === "C") {
                    wallet.selfEarnings += amount;
                } else if (level === "A" || level === "B") {
                    wallet.referralEarnings += amount;
                }
                transaction.balanceAfterTransaction = wallet.balance;
                wallet.transactions.push(transaction);
            }

            await wallet.save();
        };

        // Distribute commissions
        await creditWallet(userC._id, C_share, "Self Earning", checkout._id.toString(), "C", checkout.bookingId, userC._id);
        await ReferralCommission.create({
            fromLead: checkout._id,
            receiver: userC._id,
            amount: C_share,
        });

        if (userB) {
            await creditWallet(userB._id, B_share, "Referral Earning", checkout._id.toString(), "B", checkout.bookingId, userC._id);
            await ReferralCommission.create({
                fromLead: checkout._id,
                receiver: userB._id,
                amount: B_share,
            });
        }

        if (userA) {
            await creditWallet(userA._id, A_share, "Referral Earning", checkout._id.toString(), "A", checkout.bookingId, userC._id);
            await ReferralCommission.create({
                fromLead: checkout._id,
                receiver: userA._id,
                amount: A_share,
            });
        }

        await creditWallet(ADMIN_ID, adminShare, "Referral Earning - Admin", checkout._id.toString(), "A", checkout.bookingId, userC._id);
        await ReferralCommission.create({
            fromLead: checkout._id,
            receiver: ADMIN_ID,
            amount: adminShare,
        });

        const providerId = checkout.provider;
        const providerWallet = await ProviderWallet.findOne({ providerId });
        if (!providerWallet) {
            throw new Error(`Provider wallet not found for provider ${providerId}`);
        }

        providerWallet.balance += providerShare;
        providerWallet.withdrawableBalance += providerShare;
        providerWallet.pendingWithdraw += providerShare;
        providerWallet.totalCredits += providerShare;
        providerWallet.totalEarning += providerShare;
        providerWallet.updatedAt = new Date();

        providerWallet.transactions.push({
            type: "credit",
            amount: providerShare,
            description: "Provider earning from lead",
            referenceId: checkout._id.toString(),
            method: "Wallet",
            source: "checkout",
            status: "success",
            createdAt: new Date(),
        });

        let extraProviderShare = 0;
        let extra_C_share = 0;
        let extra_B_share = 0;
        let extra_A_share = 0;
        let extra_adminShare = 0;

        // -------------------------------------------------------------

        let extraCommissionPool = 0;

        if (typeof extraCommission === "string") {
            const trimmed = extraCommission.trim();

            if (trimmed.endsWith("%")) {
                const percent = parseFloat(trimmed.replace("%", ""));
                extraCommissionPool = (leadAmount * percent) / 100;
            } else if (/^₹?\d+(\.\d+)?$/.test(trimmed)) {
                const numericString = trimmed.replace("₹", "").trim();
                extraCommissionPool = parseFloat(numericString);
            } else {
                throw new Error("Invalid commission format. Must be a percentage (e.g. '30%') or a fixed amount like '₹2000' or '2000'.");
            }

            extraProviderShare = leadAmount - extraCommissionPool;
        } else if (typeof extraCommission === "number") {
            extraCommissionPool = extraCommission;
            extraProviderShare = leadAmount - extraCommissionPool;
        } else {
            throw new Error("Invalid commission format. Must be a percentage (e.g. '30%') or a fixed number.");
        }


        if (extraLeadAmount > 0) {


            extra_C_share = extraCommissionPool * 0.5;
            extra_B_share = extraCommissionPool * 0.2;
            extra_A_share = extraCommissionPool * 0.1;
            extra_adminShare = extraCommissionPool * 0.2;

            console.log("extra commission commission : ", extraCommissionPool);
            console.log("extra proivder commission : ", extraProviderShare);
            console.log("extra C_share commission : ", extra_C_share);
            console.log("extra B_share commission : ", extra_B_share);
            console.log("extra A_share commission : ", extra_A_share);
            console.log("extra adminShare commission : ", extra_adminShare);

            if (!userB) extra_adminShare += extra_B_share;
            if (!userA) extra_adminShare += extra_A_share;

            await creditWallet(userC._id, extra_C_share, "Self Earning", checkout._id.toString(), "C", checkout.bookingId, userC._id);
            await ReferralCommission.create({
                fromLead: checkout._id,
                receiver: userC._id,
                amount: extra_C_share,
            });

            if (userB) {
                await creditWallet(userB._id, extra_B_share, "Referral Earning", checkout._id.toString(), "B", checkout.bookingId, userC._id);
                await ReferralCommission.create({
                    fromLead: checkout._id,
                    receiver: userB._id,
                    amount: extra_B_share,
                });
            }

            if (userA) {
                await creditWallet(userA._id, extra_A_share, "Referral Earning", checkout._id.toString(), "A", checkout.bookingId, userC._id);
                await ReferralCommission.create({
                    fromLead: checkout._id,
                    receiver: userA._id,
                    amount: extra_A_share,
                });
            }

            await creditWallet(ADMIN_ID, extra_adminShare, "Referral Earning - Admin", checkout._id.toString(), checkout.bookingId, userC._id);
            await ReferralCommission.create({
                fromLead: checkout._id,
                receiver: ADMIN_ID,
                amount: extra_adminShare,
            });

            providerWallet.balance += extraProviderShare;
            providerWallet.withdrawableBalance += extraProviderShare;
            providerWallet.pendingWithdraw += extraProviderShare;
            providerWallet.totalCredits += extraProviderShare;
            providerWallet.totalEarning += extraProviderShare;
            providerWallet.updatedAt = new Date();

            providerWallet.transactions.push({
                type: "credit",
                amount: extraProviderShare,
                description: "Provider earning from extra service",
                referenceId: checkout._id.toString(),
                method: "Wallet",
                source: "checkout",
                status: "success",
                createdAt: new Date(),
            });
        }

        await providerWallet.save();

        // ✅ Deduct cash in hand from provider withdrawable and pending balances
        if (checkout.cashInHand && checkout.cashInHandAmount > 0) {
            console.log("🧾 Provider Wallet Before Cash Deduction:", {
                withdrawableBalance: providerWallet.withdrawableBalance,
                pendingWithdraw: providerWallet.pendingWithdraw,
                cashInHandAmount: checkout.cashInHandAmount,
            });
            const cashAmount = checkout.cashInHandAmount;

            providerWallet.withdrawableBalance = Math.max(providerWallet.withdrawableBalance - cashAmount, 0);
            providerWallet.pendingWithdraw = Math.max(providerWallet.pendingWithdraw - cashAmount, 0);
            providerWallet.balance = providerWallet.balance - cashAmount;
            providerWallet.totalDebits = providerWallet.totalDebits + cashAmount;

            providerWallet.transactions.push({
                type: "debit",
                amount: cashAmount,
                description: "Cash in hand collected from customer",
                referenceId: checkout._id.toString(),
                method: "Cash",
                source: "adjustment",
                status: "success",
                createdAt: new Date(),
            });

            await providerWallet.save();
        }


        checkout.commissionDistributed = true;
        checkout.isCompleted = true;
        checkout.orderStatus = "completed";
        await checkout.save();

        const todayDate = new Date().toISOString().split("T")[0];

        const adminCommissionTotal = adminShare + (extra_adminShare || 0);
        const providerEarningsTotal = providerShare + (extraProviderShare || 0);
        const totalRevenue = adminCommissionTotal;
        const franchiseEarningsTotal =
            C_share + B_share + A_share +
            (extra_C_share || 0) + (extra_B_share || 0) + (extra_A_share || 0);

        await AdminEarnings.findOneAndUpdate(
            { date: todayDate },
            {
                $inc: {
                    adminCommission: adminCommissionTotal,
                    providerEarnings: providerEarningsTotal,
                    totalRevenue: totalRevenue,
                    // Optional fields:
                    extraFees: 0,
                    pendingPayouts: 0,
                    franchiseEarnings: franchiseEarningsTotal,
                    refundsToUsers: 0,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json(
            { success: true, message: "Commission distributed successfully." },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Commission distribution failed:", message);
        return NextResponse.json(
            { success: false, message },
            { status: 500, headers: corsHeaders }
        );
    }
}
