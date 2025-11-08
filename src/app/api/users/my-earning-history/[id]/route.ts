// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/utils/db";
// import Wallet, { IWalletTransaction } from "@/models/Wallet";
// import UserBankDetails from "@/models/UserBankDetails";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// // ✅ GET User Debit Transactions
// export async function GET(req: Request) {
//   await connectToDatabase();

//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop();

//     if (!id) {
//       return NextResponse.json(
//         { success: false, message: "Missing ID parameter." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // 1. Get Wallet of User
//     const wallet = await Wallet.findOne({ userId: id });
//     if (!wallet) {
//       return NextResponse.json(
//         { success: false, message: "Wallet not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     // 2. Get User Bank Details
//     const bankDetails = await UserBankDetails.findOne({ userId: id, isActive: true });

//     // 3. Filter Debit Transactions
//     const debitTransactions = wallet.transactions
//       .filter((tx: IWalletTransaction) => tx.type === "debit")
//       .map((tx: IWalletTransaction) => ({
//         transactionId: tx.referenceId || tx._id?.toString() || "",
//         type: tx.type,
//         amount: tx.amount,
//         bankName: bankDetails?.bankName || null,
//         accountNumber: bankDetails?.accountNumber || null,
//         date: new Date(tx.createdAt).toLocaleDateString("en-IN", {
//           timeZone: "Asia/Kolkata",
//         }),
//         time: new Date(tx.createdAt).toLocaleTimeString("en-IN", {
//           timeZone: "Asia/Kolkata",
//         }),
//         status: tx.status,
//       }));

//     return NextResponse.json(
//       { success: true, data: debitTransactions },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     const message =
//       error instanceof Error ? error.message : "An unknown error occurred";
//     return NextResponse.json(
//       { success: false, message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Wallet, { IWalletTransaction } from "@/models/Wallet";
import UserBankDetails from "@/models/UserBankDetails";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ GET User Debit Transactions with Pagination
export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Get query params for pagination
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // 1. Get Wallet of User
    const wallet = await Wallet.findOne({ userId: id });
    if (!wallet) {
      return NextResponse.json(
        { success: false, message: "Wallet not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 2. Get User Bank Details
    const bankDetails = await UserBankDetails.findOne({ userId: id, isActive: true });

    // 3. Filter Debit Transactions
    const debitTransactions = wallet.transactions
      .filter((tx: IWalletTransaction) => tx.type === "credit" && tx.description === "Weekly Auto-Withdraw")
      .map((tx: IWalletTransaction) => ({
        transactionId: tx.referenceId || tx._id?.toString() || "",
        type: tx.type,
        amount: tx.amount,
        bankName: bankDetails?.bankName || null,
        accountNumber: bankDetails?.accountNumber || null,
        date: new Date(tx.createdAt).toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        time: new Date(tx.createdAt).toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        status: tx.status,
      }));

    // ✅ Pagination applied here
    const paginatedTransactions = debitTransactions.slice(skip, skip + limit);

    return NextResponse.json(
      {
        success: true,
        pagination: {
          total: debitTransactions.length,
          page,
          limit,
          totalPages: Math.ceil(debitTransactions.length / limit),
        },
        data: paginatedTransactions,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
