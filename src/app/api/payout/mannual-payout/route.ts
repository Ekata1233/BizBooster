import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import ProviderPayout from "@/models/ProviderPayout";
import UserPayout from "@/models/UserPayout";
import ProviderWallet from "@/models/ProviderWallet";
import Wallet from "@/models/Wallet";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { selectedIds, weekStart } = await req.json();

        console.log("selected Ids : ", selectedIds)
        console.log("selected weekStart : ", weekStart)


        if (!selectedIds || selectedIds.length === 0 || !weekStart) {
            return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
        }

        // Fetch all payouts by IDs (could be user or provider)
        const providerPayouts = await ProviderPayout.find({ _id: { $in: selectedIds } });
        const userPayouts = await UserPayout.find({ _id: { $in: selectedIds } });

        const allPayouts = [...providerPayouts, ...userPayouts];

        console.log("allPayouts allPayouts : ", allPayouts)


        if (allPayouts.length === 0) {
            return NextResponse.json({ success: false, message: "No matching payouts found." }, { status: 404 });
        }

        // for (const payout of allPayouts) {
        //     const pending = payout.pendingWithdraw || 0;
        //     payout.withdrawnAmount = (payout.withdrawnAmount || 0) + pending;
        //     payout.pendingWithdraw = 0;
        //     payout.status = "paid";
        //     payout.processedAt = new Date();
        //     await payout.save();
        // }

        for (const payout of allPayouts) {
            const pending = payout.pendingWithdraw || 0;
            const withdrawn = payout.withdrawnAmount || 0;

            payout.withdrawnAmount = Number((withdrawn + pending).toFixed(2));
            payout.pendingWithdraw = 0;
            payout.status = "paid";
            payout.processedAt = new Date();
            await payout.save();

            // ✅ Update corresponding wallet
            if (payout.providerId) {
                // --- Provider Wallet Update ---
                const providerWallet = await ProviderWallet.findOne({ providerId: payout.providerId });
                if (providerWallet) {
                    providerWallet.pendingWithdraw = Math.max(0, (providerWallet.pendingWithdraw || 0) - pending);
                    providerWallet.alreadyWithdrawn = Number(((providerWallet.alreadyWithdrawn || 0) + pending).toFixed(2));
                    await providerWallet.save();
                    console.log(`✅ Provider wallet updated for ${payout.providerId}`);
                }
            } else if (payout.userId) {
                // --- User Wallet Update ---
                const userWallet = await Wallet.findOne({ userId: payout.userId });
                if (userWallet) {
                    userWallet.pendingWithdraw = Math.max(0, (userWallet.pendingWithdraw || 0) - pending);
                    userWallet.alreadyWithdrawn = Number(((userWallet.alreadyWithdrawn || 0) + pending).toFixed(2));
                    await userWallet.save();
                    console.log(`✅ User wallet updated for ${payout.userId}`);
                }
            }
        }


        return NextResponse.json({
            success: true,
            message: "Payouts updated successfully.",
            count: allPayouts.length,
        });
    } catch (error) {
        console.error("Error updating payouts:", error);
        return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
    }
}
