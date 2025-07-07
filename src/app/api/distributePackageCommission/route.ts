import ReferralCommission from '@/models/ReferralCommission';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import { Types } from 'mongoose';

const ADMIN_ID = new Types.ObjectId("444c44d4444be444d4444444");
export const distributePackageCommission = async (userId: Types.ObjectId, packageId: Types.ObjectId, checkoutId: Types.ObjectId) => {
    const userC = await User.findById(userId);
    if (!userC) throw new Error("User not found");

    const userB = userC.referredBy ? await User.findById(userC.referredBy) : null;
    const userA = userB?.referredBy ? await User.findById(userB.referredBy) : null;

    const pkgCommission = await PackageCommission.findOne({ packageId });
    if (!pkgCommission) throw new Error("Package Commission structure not found");

    const creditWallet = async (
        userId: Types.ObjectId,
        amount: number,
        description: string,
        referenceId?: string
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
        };

        if (!wallet) {
            wallet = new Wallet({
                userId,
                balance: amount,
                totalCredits: amount,
                totalDebits: 0,
                transactions: [transaction],
                lastTransactionAt: new Date(),
            });
        } else {
            wallet.balance += amount;
            wallet.totalCredits += amount;
            wallet.lastTransactionAt = new Date();
            wallet.transactions.push(transaction);
        }

        await wallet.save();
    };

    // C Level
    if (pkgCommission.levelC > 0) {
        await creditWallet(userC._id, pkgCommission.levelC, "Referral Commission - Level C", checkoutId.toString());
        await ReferralCommission.create({
            fromLead: checkoutId,
            receiver: userC._id,
            amount: pkgCommission.levelC,
        });
    }

    // B Level
    if (userB && pkgCommission.levelB > 0) {
        await creditWallet(userB._id, pkgCommission.levelB, "Referral Commission - Level B", checkoutId.toString());
        await ReferralCommission.create({
            fromLead: checkoutId,
            receiver: userB._id,
            amount: pkgCommission.levelB,
        });
    }

    // A Level
    if (userA && pkgCommission.levelA > 0) {
        await creditWallet(userA._id, pkgCommission.levelA, "Referral Commission - Level A", checkoutId.toString());
        await ReferralCommission.create({
            fromLead: checkoutId,
            receiver: userA._id,
            amount: pkgCommission.levelA,
        });
    }

    // Admin
    if (pkgCommission.admin > 0) {
        await creditWallet(ADMIN_ID, pkgCommission.admin, "Referral Commission - Admin", checkoutId.toString());
        await ReferralCommission.create({
            fromLead: checkoutId,
            receiver: ADMIN_ID,
            amount: pkgCommission.admin,
        });
    }
};
