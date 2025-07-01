
import { NextResponse } from "next/server";
import { Types } from "mongoose";// adjust this path if needed
import Checkout from "@/models/Checkout";
import ReferralCommission from "@/models/ReferralCommission";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import { connectToDatabase } from "@/utils/db";

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

        const checkout = await Checkout.findById(checkoutId).populate("user");
        if (!checkout || checkout.commissionDistributed) {
            return NextResponse.json(
                { success: false, message: "Checkout not found or commission already distributed." },
                { status: 400, headers: corsHeaders }
            );
        }

        const leadAmount = checkout.totalAmount;
        const userC = checkout.user;


        const userB = userC.referredBy
            ? await User.findById(userC.referredBy)
            : null;


        const userA = userB?.referredBy
            ? await User.findById(userB.referredBy)
            : null;

        const commissionPool = leadAmount * 0.2;
        const C_share = commissionPool * 0.5;
        const B_share = commissionPool * 0.2;
        const A_share = commissionPool * 0.1;
        let adminShare = commissionPool * 0.2;

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