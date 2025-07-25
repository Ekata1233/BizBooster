import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { PackagesCommission } from "@/models/PackagesCommission";
import ReferralCommission from "@/models/ReferralCommission";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import { Types } from "mongoose";
import { Package } from "@/models/Package";
import AdminEarnings from "@/models/AdminEarnings";

// Enable CORS
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const ADMIN_ID = new Types.ObjectId("444c44d4444be444d4444444");

// For OPTIONS preflight
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// Main logic
export async function POST(req: NextRequest) {
    await connectToDatabase();

    try {
        const body = await req.json();

        const { userId } = body;

        console.log("user id : ", userId)

        const pkg = await Package.findOne(); // or use Package.findById(packageId) if you know the package
        if (!pkg || typeof pkg.price !== "number") {
            return NextResponse.json(
                { success: false, message: "Valid package not found." },
                { status: 400, headers: corsHeaders }
            );
        }

        const packagePrice = pkg.discountedPrice;

        if (!userId || !packagePrice) {
            return NextResponse.json(
                { success: false, message: "userId and packagePrice are required." },
                { status: 400, headers: corsHeaders }
            );
        }

        const userC = await User.findById(userId);

        console.log("user c : ", userC)
        if (!userC) throw new Error("User not found");

        const userB = userC.referredBy ? await User.findById(userC.referredBy) : null;
        console.log("user b : ", userB)
        const userA = userB?.referredBy ? await User.findById(userB.referredBy) : null;
        console.log("user a : ", userA)

        const pkgCommissionList = await PackagesCommission.find();
        if (!pkgCommissionList || pkgCommissionList.length === 0)
            throw new Error("Commission structure for package not found");

        const pkgCommission = pkgCommissionList[0]; // pick the first one, or filter if needed

        // const level1Amount = pkgCommission.level1Commission || 0;
        // const level2Amount = pkgCommission.level2Commission || 0;


        // // const level1Amount = pkgCommission.level1Commission || 0;
        // console.log("level1Amount : ", level1Amount)
        // // const level2Amount = pkgCommission.level2Commission || 0;
        // console.log("level2Amount : ", level2Amount)
        // const totalCommission = level1Amount + level2Amount;
        // console.log("totalCommission : ", totalCommission)
        // const adminAmount = packagePrice - totalCommission;
        // console.log("adminAmount : ", adminAmount)

        let level1Amount = 0;
        let level2Amount = 0;
        let adminAmount = 0;

        const baseLevel1 = pkgCommission.level1Commission || 0;
        const baseLevel2 = pkgCommission.level2Commission || 0;

        if (userB) {
            level1Amount = baseLevel1;
            console.log("level1Amount : ", level1Amount)
        } else {
            adminAmount += baseLevel1; // If no userB, give their share to admin
        }

        if (userA) {
            level2Amount = baseLevel2;
            console.log("level2Amount : ", level2Amount)
        } else {
            adminAmount += baseLevel2; // If no userA, give their share to admin
        }

        adminAmount += packagePrice - (baseLevel1 + baseLevel2); // Add what's left after total commission
        console.log("adminAmount : ", adminAmount)

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

        // B Level
        if (userB && level1Amount > 0) {
            await creditWallet(userB._id, level1Amount, "Package Referral Commission - Level 1", userId, "B", userId, userC._id);
            await ReferralCommission.create({
                fromLead: userC._id,
                receiver: userB._id,
                amount: level1Amount,
            });
        }

        // A Level
        if (userA && level2Amount > 0) {
            await creditWallet(userA._id, level2Amount, "Package Referral Commission - Level 2", userId, "A", userId, userC._id);
            await ReferralCommission.create({
                fromLead: userC._id,
                receiver: userA._id,
                amount: level2Amount,
            });
        }

        // Admin
        if (adminAmount > 0) {
            await creditWallet(ADMIN_ID, adminAmount, "Package Referral Commission - Admin", userId, userC._id);
            await ReferralCommission.create({
                fromLead: userC._id,
                receiver: ADMIN_ID,
                amount: adminAmount,
            });
        }

        const todayDate = new Date().toISOString().split("T")[0];

        const adminCommissionTotal = adminAmount;
        const providerEarningsTotal = 0;
        const totalRevenue = adminCommissionTotal;
        const franchiseEarningsTotal =
            level1Amount + level2Amount;

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


        console.log("Updated userC package details:");
        userC.packageType = "full";
        userC.packageActive = true;
        userC.isCommissionDistribute = true;
        await userC.save();

        console.log("Updated userC package details:", {
            packageType: userC.packageType,
            packageActive: userC.packageActive,
            isCommissionDistribute: userC.isCommissionDistribute,
        });



        return NextResponse.json(
            { success: true, message: "Package commission distributed successfully." },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
    }
}
