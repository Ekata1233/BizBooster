
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

        console.log("lead : ", lead)

        const checkout = await Checkout.findById(checkoutId).populate("user").populate({
            path: "service",
            select: "franchiseDetails.commission"
        });

        const commission = checkout.service?.franchiseDetails?.commission;
        console.log("checkout commission : ", commission)


        if (!checkout || checkout.commissionDistributed) {
            return NextResponse.json(
                { success: false, message: "commission already distributed." },
                { status: 400, headers: corsHeaders }
            );
        }

        const leadAmount = lead?.afterDiscountAmount ?? checkout.totalAmount;

        const extraLeadAmount = Array.isArray(lead?.extraService)
            ? lead.extraService.reduce((sum: number, item: { total?: number }) => sum + (item.total || 0), 0)
            : 0;

        const extraCommission = Array.isArray(lead?.extraService) && lead?.extraService.length > 0
            ? Number(lead?.extraService[0]?.commission) || 0
            : 0;

        // const leadAmount = checkout.totalAmount;
        const userC = checkout.user;


        const userB = userC.referredBy
            ? await User.findById(userC.referredBy)
            : null;


        const userA = userB?.referredBy
            ? await User.findById(userB.referredBy)
            : null;

        let commissionPool = 0;
        let providerShare = 0;

        // if (typeof commission === "string" && commission.trim().endsWith("%")) {
        //     const percent = parseFloat(commission.replace("%", ""));
        //     commissionPool = (leadAmount * percent) / 100;
        //     providerShare = leadAmount - commissionPool;
        if (typeof commission === "string") {
            const trimmed = commission.trim();

            if (trimmed.endsWith("%")) {
                const percent = parseFloat(trimmed.replace("%", ""));
                commissionPool = (leadAmount * percent) / 100;
            } else if (/^₹?\d+(\.\d+)?$/.test(trimmed)) {
                const numericString = trimmed.replace("₹", "").trim();
                commissionPool = parseFloat(numericString);
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

        // console.log("commission commission : ", commissionPool);
        // console.log("proivder commission : ", providerShare);
        const C_share = commissionPool * 0.5;
        const B_share = commissionPool * 0.2;
        const A_share = commissionPool * 0.1;
        let adminShare = commissionPool * 0.2;

        // console.log("C_share commission : ", C_share);
        // console.log("B_share commission : ", B_share);
        // console.log("A_share commission : ", A_share);
        // console.log("adminShare commission : ", adminShare);

        if (!userB) adminShare += B_share;
        if (!userA) adminShare += A_share;

        const creditWallet = async (
            userId: Types.ObjectId,
            amount: number,
            description: string,
            referenceId?: string
        ) => {
            const wallet = await Wallet.findOne({ userId });
            if (!wallet) throw new Error(`Wallet not found for user ${userId}`);

            wallet.balance += amount;
            wallet.totalCredits += amount;
            wallet.lastTransactionAt = new Date();
            wallet.transactions.push({
                type: "credit",
                amount,
                description,
                referenceId,
                method: "Wallet",
                source: "referral",
                status: "success",
                createdAt: new Date(),
            });

            await wallet.save();
        };

        // Distribute commissions
        await creditWallet(userC._id, C_share, "Referral Commission - Level C", checkout._id.toString());
        await ReferralCommission.create({
            fromLead: checkout._id,
            receiver: userC._id,
            amount: C_share,
        });

        if (userB) {
            await creditWallet(userB._id, B_share, "Referral Commission - Level B", checkout._id.toString());
            await ReferralCommission.create({
                fromLead: checkout._id,
                receiver: userB._id,
                amount: B_share,
            });
        }

        if (userA) {
            await creditWallet(userA._id, A_share, "Referral Commission - Level A", checkout._id.toString());
            await ReferralCommission.create({
                fromLead: checkout._id,
                receiver: userA._id,
                amount: A_share,
            });
        }

        await creditWallet(ADMIN_ID, adminShare, "Referral Commission - Admin", checkout._id.toString());
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


        if (extraLeadAmount > 0 && extraCommission > 0) {
            const extraCommissionPool = (extraLeadAmount * extraCommission) / 100;
            const extraProviderShare = extraLeadAmount - extraCommissionPool;

            const extra_C_share = extraCommissionPool * 0.5;
            const extra_B_share = extraCommissionPool * 0.2;
            const extra_A_share = extraCommissionPool * 0.1;
            let extra_adminShare = extraCommissionPool * 0.2;

            if (!userB) extra_adminShare += extra_B_share;
            if (!userA) extra_adminShare += extra_A_share;

            await creditWallet(userC._id, extra_C_share, "Extra Service Commission - Level C", checkout._id.toString());
            await ReferralCommission.create({
                fromLead: checkout._id,
                receiver: userC._id,
                amount: extra_C_share,
            });

            if (userB) {
                await creditWallet(userB._id, extra_B_share, "Extra Service Commission - Level B", checkout._id.toString());
                await ReferralCommission.create({
                    fromLead: checkout._id,
                    receiver: userB._id,
                    amount: extra_B_share,
                });
            }

            if (userA) {
                await creditWallet(userA._id, extra_A_share, "Extra Service Commission - Level A", checkout._id.toString());
                await ReferralCommission.create({
                    fromLead: checkout._id,
                    receiver: userA._id,
                    amount: extra_A_share,
                });
            }

            await creditWallet(ADMIN_ID, extra_adminShare, "Extra Service Commission - Admin", checkout._id.toString());
            await ReferralCommission.create({
                fromLead: checkout._id,
                receiver: ADMIN_ID,
                amount: extra_adminShare,
            });

            providerWallet.balance += extraProviderShare;
            providerWallet.totalCredits += extraProviderShare;
            providerWallet.totalEarning += extraProviderShare;
            providerWallet.updatedAt = new Date();

            providerWallet.transactions.push({
                type: "credit",
                amount: extraProviderShare,
                description: "Provider earning from extra service",
                referenceId: checkout._id.toString(),
                method: "Wallet",
                source: "extraService",
                status: "success",
                createdAt: new Date(),
            });
        }

        await providerWallet.save();

        checkout.commissionDistributed = true;
        await checkout.save();

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


// import Checkout from "@/models/Checkout";
// import ReferralCommission from "@/models/ReferralCommission";
// import User from "@/models/User";
// import Wallet from "@/models/Wallet";
// import { Types } from "mongoose";
// import { NextResponse } from "next/server";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// // Replace this with your admin ID or logic
// const ADMIN_ID = new Types.ObjectId("64f123456789abcdef123456");

// export const distributeLeadCommission = async (id: string) => {
//   try {
//     const checkout = await Checkout.findById(id).populate("generatedBy");
//     if (!checkout || checkout.commissionDistributed) {
//       return NextResponse.json(
//         { success: false, message: "Checkout not found or already distributed." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const leadAmount = checkout.totalAmount;
//     const userC = checkout.user;

//     const userB = userC.referredBy
//       ? await User.findById(userC.referredBy)
//       : null;

//     const userA = userB?.referredBy
//       ? await User.findById(userB.referredBy)
//       : null;

//     const commissionPool = leadAmount * 0.2;
//     const C_share = commissionPool * 0.5;
//     const B_share = commissionPool * 0.2;
//     const A_share = commissionPool * 0.1;
//     let adminShare = commissionPool * 0.2;

//     if (!userB) adminShare += B_share;
//     if (!userA) adminShare += A_share;

//     const creditWallet = async (
//       userId: Types.ObjectId,
//       amount: number,
//       description: string,
//       referenceId?: string
//     ) => {
//       const wallet = await Wallet.findOne({ userId });
//       if (!wallet) throw new Error(`Wallet not found for user ${userId}`);

//       wallet.balance += amount;
//       wallet.totalCredits += amount;
//       wallet.lastTransactionAt = new Date();
//       wallet.transactions.push({
//         type: "credit",
//         amount,
//         description,
//         referenceId,
//         method: "Wallet",
//         source: "referral",
//         status: "success",
//         createdAt: new Date(),
//       });

//       await wallet.save();
//     };

//     // Distribute commissions
//     await creditWallet(userC._id, C_share, "Referral Commission - Level C", checkout._id.toString());
//     await ReferralCommission.create({
//       fromLead: checkout._id,
//       receiver: userC._id,
//       amount: C_share,
//     });

//     if (userB) {
//       await creditWallet(userB._id, B_share, "Referral Commission - Level B", checkout._id.toString());
//       await ReferralCommission.create({
//         fromLead: checkout._id,
//         receiver: userB._id,
//         amount: B_share,
//       });
//     }

//     if (userA) {
//       await creditWallet(userA._id, A_share, "Referral Commission - Level A", checkout._id.toString());
//       await ReferralCommission.create({
//         fromLead: checkout._id,
//         receiver: userA._id,
//         amount: A_share,
//       });
//     }

//     await creditWallet(ADMIN_ID, adminShare, "Referral Commission - Admin", checkout._id.toString());
//     await ReferralCommission.create({
//       fromLead: checkout._id,
//       receiver: ADMIN_ID,
//       amount: adminShare,
//     });

//     checkout.commissionDistributed = true;
//     await checkout.save();

//     return NextResponse.json(
//       { success: true, message: "Commission distributed successfully." },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     console.error("Error distributing commission:", error.message || error);
//     return NextResponse.json(
//       { success: false, message: "Failed to distribute commission.", error: error.message || error },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// };




// import Lead from "@/models/Lead";
// import Checkout from "@/models/Checkout";
// import ReferralCommission from "@/models/ReferralCommission";
// import User from "@/models/User";
// import Wallet from "@/models/Wallet";
// import { Types } from "mongoose";
// import { NextResponse } from "next/server";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// // Replace this with your admin ID or logic
// const ADMIN_ID = new Types.ObjectId("64f123456789abcdef123456");

// export const distributeLeadCommission = async (id: string) => {
//     const checkout = await Checkout.findById(id).populate("generatedBy");
//     if (!checkout || checkout.commissionDistributed) return;

//     const leadAmount = checkout.totalAmount;
//     const userC = checkout.user;

//     const userB = userC.referredBy
//         ? await User.findById(userC.referredBy)
//         : null;

//     const userA = userB?.referredBy
//         ? await User.findById(userB.referredBy)
//         : null;

//     const commissionPool = leadAmount * 0.2;
//     const providerShare = leadAmount * 0.8;

//     const C_share = commissionPool * 0.5;
//     const B_share = commissionPool * 0.2;
//     const A_share = commissionPool * 0.1;
//     let adminShare = commissionPool * 0.2;

//     // Add B and A shares to admin if missing
//     if (!userB) adminShare += B_share;
//     if (!userA) adminShare += A_share;

//     const creditWallet = async (
//         userId: Types.ObjectId,
//         amount: number,
//         description: string,
//         referenceId?: string
//     ) => {
//         const wallet = await Wallet.findOne({ userId });
//         if (!wallet) throw new Error(`Wallet not found for user ${userId}`);

//         wallet.balance += amount;
//         wallet.totalCredits += amount;
//         wallet.lastTransactionAt = new Date();
//         wallet.transactions.push({
//             type: "credit",
//             amount,
//             description,
//             referenceId,
//             method: "Wallet",
//             source: "referral",
//             status: "success",
//             createdAt: new Date(),
//         });

//         await wallet.save();
//     };

//     // ---- Distribute commissions ----

//     await creditWallet(userC._id, C_share, "Referral Commission - Level C", checkout._id.toString());
//     await ReferralCommission.create({
//         fromLead: checkout._id,
//         receiver: userC._id,
//         amount: C_share,
//     });

//     if (userB) {
//         await creditWallet(userB._id, B_share, "Referral Commission - Level B", checkout._id.toString());
//         await ReferralCommission.create({
//             fromLead: checkout._id,
//             receiver: userB._id,
//             amount: B_share,
//         });
//     }

//     if (userA) {
//         await creditWallet(userA._id, A_share, "Referral Commission - Level A", checkout._id.toString());
//         await ReferralCommission.create({
//             fromLead: checkout._id,
//             receiver: userA._id,
//             amount: A_share,
//         });
//     }

//     await creditWallet(ADMIN_ID, adminShare, "Referral Commission - Admin", checkout._id.toString());
//     await ReferralCommission.create({
//         fromLead: checkout._id,
//         receiver: ADMIN_ID,
//         amount: adminShare,
//     });

//     checkout.commissionDistributed = true;
//     await checkout.save();
// };







// Credit Customer C (lead generator)
//   userC.walletBalance += C_share;
//   await userC.save();
//   await ReferralCommission.create({
//     fromLead: lead._id,
//     receiver: userC._id,
//     amount: C_share,
//   });
//   if (userB) {
//     userB.walletBalance += B_share;
//     await userB.save();
//     await ReferralCommission.create({
//       fromLead: lead._id,
//       receiver: userB._id,
//       amount: B_share,
//     });
//   }
//   if (userA) {
//     userA.walletBalance += A_share;
//     await userA.save();
//     await ReferralCommission.create({
//       fromLead: lead._id,
//       receiver: userA._id,
//       amount: A_share,
//     });
//   }
//   if (ADMIN_ID) {
//     await ReferralCommission.create({
//       fromLead: lead._id,
//       receiver: ADMIN_ID,
//       amount: adminShare,
//     });
//     await User.findByIdAndUpdate(
//       ADMIN_ID,
//       { $inc: { walletBalance: adminShare } },
//       { new: true }
//     );
//   }