import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { PackagesCommission } from "@/models/PackagesCommission";
import ReferralCommission from "@/models/ReferralCommission";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import { Types } from "mongoose";
import { Package } from "@/models/Package";
import AdminEarnings from "@/models/AdminEarnings";
import Deposite from "@/models/Deposite";
import { checkAndUpdateReferralStatus } from "@/utils/packageStatus";

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


        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found." },
                { status: 404, headers: corsHeaders }
            );
        }

        const pkg = await Package.findOne(); // or use Package.findById(packageId) if you know the package
        if (!pkg || typeof pkg.price !== "number") {
            return NextResponse.json(
                { success: false, message: "Valid package not found." },
                { status: 400, headers: corsHeaders }
            );
        }


        // const packagePrice = pkg.grandtotal;
        const packagePrice = user.packagePrice && user.packagePrice > 0
            ? user.packagePrice
            : pkg.grandtotal;

        if (!userId || !packagePrice) {
            return NextResponse.json(
                { success: false, message: "userId and packagePrice are required." },
                { status: 400, headers: corsHeaders }
            );
        }


        const userC = await User.findById(userId);
        if (!userC) throw new Error("User not found");

        if (userC.packageActive && userC.isCommissionDistribute) {
            return NextResponse.json(
                { success: false, message: "Commission already distributed for this user." },
                { status: 400, headers: corsHeaders }
            );
        }

        /* ---------------- commission logic stays same ---------------- */
        const userB = userC.referredBy ? await User.findById(userC.referredBy) : null;
        const userA = userB?.referredBy ? await User.findById(userB.referredBy) : null;

        const pkgCommissionList = await PackagesCommission.find();
        if (!pkgCommissionList || pkgCommissionList.length === 0)
            throw new Error("Commission structure for package not found");

        const pkgCommission = pkgCommissionList[0];
        let level1Amount = 0;
        let level2Amount = 0;
        let adminAmount = 0;

        const baseLevel1 = pkgCommission.level1Commission || 0;
        const baseLevel2 = pkgCommission.level2Commission || 0;

        if (userB && !userB.isDeleted) {
            level1Amount = baseLevel1;
        } else {
            adminAmount += baseLevel1; // userB missing or deleted
        }

        if (userA && !userA.isDeleted) {
            level2Amount = baseLevel2;
        } else {
            adminAmount += baseLevel2; // userA missing or deleted
        }


        // adminAmount += packagePrice - (baseLevel1 + baseLevel2); 
        //because package price is less then amount goes to negative
        const remaining = packagePrice - (baseLevel1 + baseLevel2);
        adminAmount += remaining > 0 ? remaining : 0;


        const creditWallet = async (
            userId: Types.ObjectId,
            amount: number,
            description: string,
            referenceId?: string,
            level?: "A" | "B" | "C" | "Admin",
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
                    pendingWithdraw: amount,
                    totalDebits: 0,
                    selfEarnings: level === "C" ? amount : 0,
                    referralEarnings: level === "A" || level === "B" ? amount : 0,
                    transactions: [transaction],
                    lastTransactionAt: new Date(),
                });
            } else {

                wallet.balance = Number((wallet.balance + amount).toFixed(2));
                wallet.totalCredits = Number((wallet.totalCredits + amount).toFixed(2));
                wallet.pendingWithdraw = Number((wallet.pendingWithdraw + amount).toFixed(2));
                wallet.lastTransactionAt = new Date();
                if (level === "C") wallet.selfEarnings = Number((wallet.selfEarnings + amount).toFixed(2));
                else if (level === "A" || level === "B") wallet.referralEarnings = Number((wallet.referralEarnings + amount).toFixed(2));
                transaction.balanceAfterTransaction = wallet.balance;
                wallet.transactions.push(transaction);
            }

            await wallet.save();
        };

        // distribute commissions
        if (userB && !userB.isDeleted && level1Amount > 0) {
            await creditWallet(userB._id, level1Amount, "Team Build Commission - Level 1", userId, "B", "-", userC.userId || userC._id);
            await ReferralCommission.create({ fromLead: userC._id, receiver: userB._id, amount: level1Amount });
        }

        if (userA && level2Amount > 0) {
            await creditWallet(userA._id, level2Amount, "Team Build Commission - Level 2", userId, "A", "-", userC.userId || userC._id);
            await ReferralCommission.create({ fromLead: userC._id, receiver: userA._id, amount: level2Amount });
        }

        const adminDeposit = pkg.deposit;
        const adminTeamBuildCommission =
            (pkg.discountedPrice || 0) - (level1Amount + level2Amount);

        console.log("level1Amount : ", level1Amount)
        console.log("level2Amount : ", level2Amount)
        console.log("depostie : ", adminDeposit)
        console.log("adminTeamBuildCommission : ", adminTeamBuildCommission)

        if (adminDeposit > 0) {
            await creditWallet(
                ADMIN_ID,
                adminDeposit,
                "Deposit", userId, "Admin", "-",
                userC.userId || userC._id
            );
            await ReferralCommission.create({
                fromLead: userC._id,
                receiver: ADMIN_ID,
                amount: adminDeposit,
            });
        }

        // Remaining discountedPrice after userA & userB commissions
        if (adminTeamBuildCommission > 0) {
            await creditWallet(
                ADMIN_ID,
                adminTeamBuildCommission,
                "Team Build Commission - Admin", userId, "Admin", "-",
                userC.userId || userC._id
            );
            await ReferralCommission.create({
                fromLead: userC._id,
                receiver: ADMIN_ID,
                amount: adminTeamBuildCommission,
            });
        }

        let actualFranchiseEarnings = 0;
        if (userB && !userB.isDeleted) {
            actualFranchiseEarnings += level1Amount;
        }
        if (userA && !userA.isDeleted) {
            actualFranchiseEarnings += level2Amount;
        }

        actualFranchiseEarnings = Math.round(actualFranchiseEarnings * 100) / 100;
        const adminAmountRounded = Math.round(adminAmount * 100) / 100;
        const totalRevenue = Math.round((adminAmountRounded + actualFranchiseEarnings) * 100) / 100;

        const todayDate = new Date().toISOString().split("T")[0];

        await AdminEarnings.findOneAndUpdate(
            { date: todayDate },
            {
                $inc: {
                    adminCommission: adminAmountRounded,
                    providerEarnings: 0,
                    totalRevenue: totalRevenue,
                    extraFees: 0,
                    pendingPayouts: 0,
                    franchiseEarnings: actualFranchiseEarnings,
                    refundsToUsers: 0,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        /* ---------------- ✅ New: Save package into Deposite ---------------- */
        await Deposite.create({
            // user: userC._id,
            // packagePrice: pkg.discountedPrice || pkg.grandtotal,
            // deposite: pkg.deposit,
            // monthlyEarnings: pkg.monthlyEarnings,
            // lockInPeriod: pkg.lockInPeriod,
            // packageActivateDate: new Date()
            user: userC._id,
            packagePrice: Number((pkg.discountedPrice || pkg.grandtotal).toFixed(2)),
            deposite: Number(pkg.deposit.toFixed(2)),
            monthlyEarnings: Number(pkg.monthlyEarnings.toFixed(2)),
            lockInPeriod: pkg.lockInPeriod,
            packageActivateDate: new Date()
        });

        /* ---------------- user update ---------------- */
        userC.packageType = "full";
        userC.packageActive = true;
        userC.packageActivateDate = new Date();
        userC.isCommissionDistribute = true;
        userC.packageStatus = "GP"
        await userC.save();

        await checkAndUpdateReferralStatus(userId);

        return NextResponse.json(
            { success: true, message: "Package commission distributed & deposit saved successfully." },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
    }
}




