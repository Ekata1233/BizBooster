// // src/app/api/cashfree/request-payout/route.ts
// import { NextResponse } from "next/server";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { status: 200, headers: corsHeaders });
// }

// export async function POST(req: Request) {
//   try {
//    const body = await req.json();

//     const transferId = body.transfer_id;
//     const amount = body.transfer_amount;
//     const beneId = body.beneficiary_details?.beneficiary_id;

//     console.log("amount : ", amount, "beneId : ", beneId, "transferId : ", transferId);

//     const res = await fetch("https://sandbox.cashfree.com/payout/transfers", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-version": "2024-01-01",
//         "x-client-id": process.env.CASHFREE_PAYOUT_ID!,
//         "x-client-secret": process.env.CASHFREE_PAYOUT_SECRET_KEY!,
//       },
//       body: JSON.stringify({
//         transfer_id: transferId,
//         transfer_amount: amount,
//         beneficiary_details: {
//           beneficiary_id: beneId,
//         },
//       }),
//     });

//     const data = await res.json();

//     return NextResponse.json(data, {
//       status: res.status,
//       headers: corsHeaders,
//     });
//   } catch (error) {
//     console.error("Error requesting payout:", error);
//     return NextResponse.json(
//       { error: "Payout request failed", details: error },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


// src/app/api/cashfree/request-payout/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Wallet, { IWalletTransaction } from "@/models/Wallet";
import User from "@/models/User";
import "@/models/User"
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}


//------------------------------CORRECTED WORKING--------------------
// export async function POST(req: Request) {
//   await connectToDatabase();

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const body = await req.json();

//     const userId = body.userId;
//     const amount = body.transfer_amount;
//     const beneficiaryId = body.userId;

//     console.log("amount : ", amount)

//     if (!userId || !amount || !beneficiaryId) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // 1️⃣ Find user & wallet
//     const user = await User.findById(userId);
//     if (!user) throw new Error("User not found");

//     const wallet = await Wallet.findOne({ userId: user._id }).session(session);
//     if (!wallet) throw new Error("Wallet not found");

//     console.log("user wallet : ", wallet)


//     // 2️⃣ Check wallet balance
//     if (wallet.balance < amount) {
//       return NextResponse.json(
//         { error: "Insufficient wallet balance" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // 3️⃣ Deduct balance (pending txn first)
//     wallet.balance -= amount;
//     wallet.totalDebits += amount;
//     wallet.lastTransactionAt = new Date();

//     const transferId = `${Date.now()}${user._id.toString().slice(-6).replace(/\D/g, "")}`;

//     wallet.transactions.push({
//       type: "debit",
//       amount,
//       from: "wallet",
//       description: "User withdrawal",
//       referenceId: transferId,
//       method: "BankTransfer",
//       source: "payout",
//       status: "pending",
//       createdAt: new Date(),
//       balanceAfterTransaction: wallet.balance,
//       leadId: "",
//       commissionFrom: "",
//     });

//     await wallet.save({ session });

//     // 4️⃣ Call Cashfree API
//     const res = await fetch("https://sandbox.cashfree.com/payout/transfers", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-version": "2024-01-01",
//         "x-client-id": process.env.CASHFREE_PAYOUT_ID!,
//         "x-client-secret": process.env.CASHFREE_PAYOUT_SECRET_KEY!,
//       },
//       body: JSON.stringify({
//         transfer_id: transferId,
//         transfer_amount: amount,
//         transfer_currency: "INR",
//         beneficiary_details: { beneficiary_id: beneficiaryId },
//       }),
//     });

//     const data = await res.json();

//     // 5️⃣ Update txn status after response
//     const txn = wallet.transactions.find((t: IWalletTransaction) => t.referenceId === transferId);
//     if (txn) txn.status = data.status?.toLowerCase() || "failed";

//     await wallet.save({ session });
//     await session.commitTransaction();

//     return NextResponse.json(data, {
//       status: res.status,
//       headers: corsHeaders,
//     });

//   } catch (error: any) {
//     await session.abortTransaction();
//     console.error("Error requesting payout:", error);

//     return NextResponse.json(
//       { error: "Withdrawal failed", details: error.message },
//       { status: 500, headers: corsHeaders }
//     );
//   } finally {
//     session.endSession();
//   }
// }

//-----------------SOLUTION ON STATUS FAILED STILL DEBITED (FINAL)-----------------------
// export async function POST(req: Request) {
//   await connectToDatabase();

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const body = await req.json();
//     const userId = body.userId;
//     const amount = body.transfer_amount;
//     const beneficiaryId = body.userId; // ⚠️ confirm this is correct

//     if (!userId || !amount || !beneficiaryId) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // 1️⃣ Find user & wallet
//     const user = await User.findById(userId);
//     if (!user) throw new Error("User not found");

//     const wallet = await Wallet.findOne({ userId: user._id }).session(session);
//     if (!wallet) throw new Error("Wallet not found");

//     // 2️⃣ Check balance (before API call)
//     if (wallet.balance < amount) {
//       return NextResponse.json(
//         { error: "Insufficient wallet balance" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // 3️⃣ Generate transferId
//     const transferId = `${Date.now()}${user._id
//       .toString()
//       .slice(-6)
//       .replace(/\D/g, "")}`;

//     // 4️⃣ Call Cashfree API
//     const res = await fetch("https://sandbox.cashfree.com/payout/transfers", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-version": "2024-01-01",
//         "x-client-id": process.env.CASHFREE_PAYOUT_ID!,
//         "x-client-secret": process.env.CASHFREE_PAYOUT_SECRET_KEY!,
//       },
//       body: JSON.stringify({
//         transfer_id: transferId,
//         transfer_amount: amount,
//         transfer_currency: "INR",
//         beneficiary_details: { beneficiary_id: beneficiaryId },
//       }),
//     });

//     const data = await res.json();


//     // 5️⃣ If API success → debit wallet
// if (data.status?.toUpperCase() === "RECEIVED") {

//       wallet.transactions.push({
//         type: "debit",
//         amount,
//         from: "wallet",
//         description: "User withdrawal",
//         referenceId: transferId,
//         method: "BankTransfer",
//         source: "payout",
//         status: "pending",
//         createdAt: new Date(),
//         balanceAfterTransaction: wallet.balance,
//         leadId: "",
//         commissionFrom: "",
//       });

//       await wallet.save({ session });
//       await session.commitTransaction();
//     } else {
//       // API failed → don't touch balance
//       wallet.transactions.push({
//         type: "debit",
//         amount,
//         from: "wallet",
//         description: "User withdrawal",
//         referenceId: transferId,
//         method: "BankTransfer",
//         source: "payout",
//         status: "failed",
//         createdAt: new Date(),
//         balanceAfterTransaction: wallet.balance, // unchanged
//         leadId: "",
//         commissionFrom: "",
//       });

//       await wallet.save({ session });
//       await session.commitTransaction();
//     }

//     return NextResponse.json(data, {
//       status: res.status,
//       headers: corsHeaders,
//     });
//   } catch (error: any) {
//     await session.abortTransaction();
//     console.error("Error requesting payout:", error);

//     return NextResponse.json(
//       { error: "Withdrawal failed", details: error.message },
//       { status: 500, headers: corsHeaders }
//     );
//   } finally {
//     session.endSession();
//   }
// }


//--------------AUTO DEBITED PAYOUT-------------------
const ADMIN_ID = new mongoose.Types.ObjectId("444c44d4444be444d4444444");
export async function GET() {
  await connectToDatabase();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallets = await Wallet.find({ balance: { $gt: 0 } }).populate("userId");

    for (const wallet of wallets) {
      const user = wallet.userId;
      const amount = wallet.balance;

      if (!user || amount <= 0 || user._id.equals(ADMIN_ID)) continue;

      const beneficiaryId = user._id.toString();

      // 🔹 Step 1: Check if beneficiary exists
      const checkRes = await fetch(
        `https://sandbox.cashfree.com/payout/beneficiaries/${beneficiaryId}`,
        {
          method: "GET",
          headers: {
            "x-api-version": "2024-01-01",
            "x-client-id": process.env.CASHFREE_PAYOUT_ID!,
            "x-client-secret": process.env.CASHFREE_PAYOUT_SECRET_KEY!,
          },
        }
      );

      if (checkRes.status !== 200) {
        console.log(`⚠️ Skipping payout: Beneficiary ${beneficiaryId} not found`);
        continue; // ❌ skip, don't push transaction
      }

      const transferId = `${Date.now()}${beneficiaryId
        .slice(-6)
        .replace(/\D/g, "")}`;

      // 🔹 Step 2: Initiate payout
      const res = await fetch("https://sandbox.cashfree.com/payout/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2024-01-01",
          "x-client-id": process.env.CASHFREE_PAYOUT_ID!,
          "x-client-secret": process.env.CASHFREE_PAYOUT_SECRET_KEY!,
        },
        body: JSON.stringify({
          transfer_id: transferId,
          transfer_amount: amount,
          transfer_currency: "INR",
          beneficiary_details: { beneficiary_id: beneficiaryId },
        }),
      });

      const data = await res.json();

      // ✅ Only push transaction if payout API did not return an error
      if (!data.type && data.transfer_id) {
        wallet.transactions.push({
          type: "debit",
          amount,
          from: "wallet",
          description: "Weekly auto-withdrawal",
          referenceId: transferId,
          method: "BankTransfer",
          source: "payout",
          status:
            data.status?.toUpperCase() === "RECEIVED" ? "pending" : "failed",
          createdAt: new Date(),
          balanceAfterTransaction: wallet.balance,
          leadId: "",
          commissionFrom: "",
        });

        await wallet.save({ session });
      } else {
        console.log(
          `⚠️ Skipping transaction push for ${beneficiaryId}, reason: ${data.message}`
        );
      }
    }


    await session.commitTransaction();
    return NextResponse.json({ message: "✅ Weekly payouts initiated" });
  } catch (err: any) {
    await session.abortTransaction();
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    session.endSession();
  }
}