import { NextResponse } from "next/server";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import Deposite from "@/models/Deposite";
import { connectToDatabase } from "@/utils/db";

export async function GET(req: Request) {
    try {

        const { searchParams } = new URL(req.url);
        if (searchParams.get("health") === "true") {
            return NextResponse.json({ status: "ok", message: "Cron endpoint reachable" });
        }
        await connectToDatabase();
        const today = new Date();

        const forceRun = searchParams.get("forceRun") === "true";

        // Only run on 11th (or if forceRun=true)
        if (!forceRun && today.getDate() !== 11) {
            return NextResponse.json({ message: "Not 11th today. Skipping." });
        }

        const users = await User.find({ packageActive: true });

        console.log("users data : ", users)

        for (const user of users) {
            if (!user.packageActivateDate) continue;

            const activationDate = new Date(user.packageActivateDate);

            // Count how many deposits already made
            const depositsCount = await Deposite.countDocuments({ user: user._id });
            if (depositsCount >= 36) continue;

            // Rule: if activated 1-10 => first credit next month, else month after next
            const isFirstHalf = activationDate.getDate() <= 10;
            let firstCreditMonth = activationDate.getMonth() + (isFirstHalf ? 1 : 2);
            let firstCreditYear = activationDate.getFullYear();

            if (firstCreditMonth > 11) {
                firstCreditMonth = firstCreditMonth % 12;
                firstCreditYear += 1;
            }

            const firstCreditDate = new Date(firstCreditYear, firstCreditMonth, 11);
            const payoutDate = new Date(firstCreditDate);
            payoutDate.setMonth(firstCreditDate.getMonth() + depositsCount);

            // Only credit if today is the payout date
            if (
                payoutDate.getDate() === today.getDate() &&
                payoutDate.getMonth() === today.getMonth() &&
                payoutDate.getFullYear() === today.getFullYear()
            ) {
                const depositeData = await Deposite.findOne({ user: user._id }).sort({ createdAt: -1 });

                console.log("depositeData : ", depositeData)

                // If deposit exists, take its monthlyEarnings, else fallback
                const amount = depositeData?.monthlyEarnings || 3000;
                console.log("amount : ", amount)


                if (amount <= 0) continue;
                // 1. Create Deposit record
                await Deposite.create({
                    user: user._id,
                    packagePrice: user.packagePrice,
                    monthlyEarnings: amount,
                    lockInPeriod: 36,
                    deposite: amount,
                    packageActivateDate: user.packageActivateDate,
                });

                // 2. Update Wallet
                const wallet = await Wallet.findOne({ userId: user._id });
                if (wallet) {
                    wallet.balance += amount;
                    wallet.totalCredits += amount;
                    wallet.pendingWithdraw += amount;
                    wallet.transactions.push({
                        type: "credit",
                        amount,
                        from: "System",
                        description: "Monthly package earning",
                        balanceAfterTransaction: wallet.balance,
                        createdAt: new Date(),
                        leadId: "Monthly Earning",
                        commissionFrom: "Monthly Earning",
                    });
                    wallet.lastTransactionAt = new Date();
                    await wallet.save();
                }
            }
        }

        return NextResponse.json({ message: "Monthly credit job completed." });
    } catch (error: any) {
        console.error("Cron error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
