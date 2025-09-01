// // src/app/api/cashfree/payout-status/route.ts
// import { NextResponse } from "next/server";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// // ─────────────── OPTIONS (CORS preflight) ───────────────
// export async function OPTIONS() {
//   return NextResponse.json({}, { status: 200, headers: corsHeaders });
// }

// // ─────────────── POST (Check Batch Payout Status) ───────────────
// export async function POST(req: Request) {
//   try {
//      const {  batchTransferId, transfers } = await req.json();

//     // Make GET request to Cashfree's Batch Transfer Status API
//     const res = await fetch(
//       "https://sandbox.cashfree.com/payout/transfers/batch",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-api-version": "2024-01-01",
//           "x-client-id":process.env.CASHFREE_PAYOUT_ID!,
//           "x-client-secret":process.env.CASHFREE_PAYOUT_SECRET_KEY!,
//          },
//         body: JSON.stringify({
//           batch_transfer_id: batchTransferId,
//           transfers: transfers,
//         }),
//       }
//     );

//     const data = await res.json();

//     return NextResponse.json(data, {
//       status: res.status,
//       headers: corsHeaders,
//     });
//   } catch (error) {
//     console.error("Error creating batch transfer:", error);
//     return NextResponse.json(
//       { error: "Batch transfer failed", details: error },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

// import { NextResponse } from "next/server";
// import mongoose from "mongoose";
// import Wallet from "@/models/Wallet";
// import { IWalletTransaction } from "@/models/Wallet";
// import { connectToDatabase } from "@/utils/db";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// // ─────────────── OPTIONS (CORS preflight) ───────────────
// export async function OPTIONS() {
//   return NextResponse.json({}, { status: 200, headers: corsHeaders });
// }

// // ─────────────── POST (Check Single Payout Status) ───────────────
// export async function POST(req: Request) {
//   await connectToDatabase();

//   try {
//     const { transferId, userId } = await req.json();

//     if (!transferId || !userId) {
//       return NextResponse.json(
//         { error: "Missing transferId or userId" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // 1️⃣ Call Cashfree API for transfer status
//     const res = await fetch(
//       `https://sandbox.cashfree.com/payout/transfers/${transferId}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           "x-api-version": "2024-01-01",
//           "x-client-id": process.env.CASHFREE_PAYOUT_ID!,
//           "x-client-secret": process.env.CASHFREE_PAYOUT_SECRET_KEY!,
//         },
//       }
//     );

//     const data = await res.json();

//     // 2️⃣ Update wallet transaction status
//     const wallet = await Wallet.findOne({ userId: new mongoose.Types.ObjectId(userId) });
//     if (wallet) {
//       const txn = (wallet.transactions as IWalletTransaction[]).find(
//         (t) => t.referenceId === transferId
//       );
//       if (txn) {
//         txn.status = data.status?.toLowerCase() || "pending";
//         await wallet.save();
//       }
//     }

//     return NextResponse.json(data, {
//       status: res.status,
//       headers: corsHeaders,
//     });
//   } catch (error: any) {
//     console.error("Error checking payout status:", error);
//     return NextResponse.json(
//       { error: "Payout status check failed", details: error.message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Wallet from "@/models/Wallet";
import { IWalletTransaction } from "@/models/Wallet";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ─────────────── OPTIONS (CORS preflight) ───────────────
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

// ─────────────── POST (Check Single Payout Status) ───────────────
export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const { transferId, userId } = await req.json();

    if (!transferId || !userId) {
      return NextResponse.json(
        { error: "Missing transferId or userId" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1️⃣ Call Cashfree API for transfer status (✅ query param, not path param)
    const res = await fetch(
      `https://sandbox.cashfree.com/payout/transfers?transfer_id=${transferId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2024-01-01",
          "x-client-id": process.env.CASHFREE_PAYOUT_ID!,
          "x-client-secret": process.env.CASHFREE_PAYOUT_SECRET_KEY!,
        },
      }
    );

    const data = await res.json();

    // 2️⃣ Update wallet transaction status
    const wallet = await Wallet.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (wallet) {
      const txn = (wallet.transactions as IWalletTransaction[]).find(
        (t) => t.referenceId === transferId
      );

      if (txn) {
        const cashfreeStatus = data.status?.toUpperCase() || "PENDING";

        if (cashfreeStatus === "SUCCESS") {
          // ✅ Final debit when Cashfree confirms success
          wallet.balance -= txn.amount;
          wallet.totalDebits += txn.amount;
          wallet.lastTransactionAt = new Date();

          txn.status = "success";
          txn.balanceAfterTransaction = wallet.balance;
        } else if (cashfreeStatus === "FAILED") {
          txn.status = "failed";
        } else {
          txn.status = "pending";
        }

        txn.leadId = data.cf_transfer_id || null;
        txn.description = data.status_description || "No description provided";

        await wallet.save();
      }
    }


    return NextResponse.json(data, {
      status: res.status,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error("Error checking payout status:", error);
    return NextResponse.json(
      { error: "Payout status check failed", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
