import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { PackagesCommission } from "@/models/PackagesCommission";
import ReferralCommission from "@/models/ReferralCommission";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import { Types } from "mongoose";
import { Package } from "@/models/Package";
import AdminEarnings from "@/models/AdminEarnings";
import Deposite from "@/models/Deposite";   // ✅ added import

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

        console.log("pakcage price : ", pkg)

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

        console.log("packages ", pkg);

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

        if (userB) level1Amount = baseLevel1;
        else adminAmount += baseLevel1;

        if (userA) level2Amount = baseLevel2;
        else adminAmount += baseLevel2;

        adminAmount += packagePrice - (baseLevel1 + baseLevel2);

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
                if (level === "C") wallet.selfEarnings += amount;
                else if (level === "A" || level === "B") wallet.referralEarnings += amount;
                transaction.balanceAfterTransaction = wallet.balance;
                wallet.transactions.push(transaction);
            }

            await wallet.save();
        };

        // distribute commissions
        if (userB && level1Amount > 0) {
            await creditWallet(userB._id, level1Amount, "Team Build Commission - Level 1", userId, "B", "-", userC.userId || userC._id);
            await ReferralCommission.create({ fromLead: userC._id, receiver: userB._id, amount: level1Amount });
        }

        if (userA && level2Amount > 0) {
            await creditWallet(userA._id, level2Amount, "Team Build Commission - Level 2", userId, "A", "-", userC.userId || userC._id);
            await ReferralCommission.create({ fromLead: userC._id, receiver: userA._id, amount: level2Amount });
        }

        if (adminAmount > 0) {
            await creditWallet(ADMIN_ID, adminAmount, "Team Build Commission - Admin", "-", userC.userId || userC._id);
            await ReferralCommission.create({ fromLead: userC._id, receiver: ADMIN_ID, amount: adminAmount });
        }

        const todayDate = new Date().toISOString().split("T")[0];
        await AdminEarnings.findOneAndUpdate(
            { date: todayDate },
            {
                $inc: {
                    adminCommission: adminAmount,
                    providerEarnings: 0,
                    totalRevenue: adminAmount,
                    extraFees: 0,
                    pendingPayouts: 0,
                    franchiseEarnings: level1Amount + level2Amount,
                    refundsToUsers: 0,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        /* ---------------- ✅ New: Save package into Deposite ---------------- */
        await Deposite.create({
            user: userC._id,
            packagePrice: pkg.discountedPrice || pkg.grandtotal,
            deposite: pkg.deposit,
            monthlyEarnings: pkg.monthlyEarnings,
            lockInPeriod: pkg.lockInPeriod,
            packageActivateDate: new Date()
        });

        /* ---------------- user update ---------------- */
        userC.packageType = "full";
        userC.packageActive = true;
        userC.packageActivateDate = new Date();
        userC.isCommissionDistribute = true;
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


export async function checkAndUpdateReferralStatus(userId: string) {
  const user = await User.findById(userId);

  if (!user || !user.referredBy) return; // no referrer or user not found

  const parent = await User.findById(user.referredBy);
  if (!parent) return;

  // Step 1: If parent has packageActive -> ensure GP
  if (parent.packageActive && !parent.packageStatus) {
    parent.packageStatus = "GP";
    await parent.save();
  }

  // Step 2: Check if parent has 10 direct referrals with packageActive true
  const referrals = await User.find({ referredBy: parent._id, packageActive: true });
  if (referrals.length >= 3 && parent.packageStatus === "GP") {
    parent.packageStatus = "SGP";
    await parent.save();
  }

  // Step 3: If parent is SGP, check how many referrals are also SGP
  const sgpCount = await User.countDocuments({
    referredBy: parent._id,
    packageStatus: "SGP",
  });
  if (sgpCount >= 1 && parent.packageStatus === "SGP") {
    parent.packageStatus = "PGP";
    await parent.save();
  }
}

