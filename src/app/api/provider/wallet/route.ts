// // app/api/wallet/send/route.ts
// import { NextResponse } from "next/server";
// import ProviderWallet, { IWalletTransaction } from "@/models/ProviderWallet";
// import { connectToDatabase } from "@/utils/db";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function POST(req: Request) {
//   try {
//     await connectToDatabase();
//     const body = await req.json();

//     const { providerId, amount } = body;

//     if (!providerId || typeof amount !== "number" || amount <= 0) {
//       return NextResponse.json(
//         { success: false, message: "Invalid provider ID or amount" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const wallet = await ProviderWallet.findOne({ providerId });

//     if (!wallet) {
//       return NextResponse.json(
//         { success: false, message: "Wallet not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     const transaction: IWalletTransaction = {
//       type: "credit",
//       amount,
//       description: "Admin top-up",
//       method: "Wallet",
//       source: "topup",
//       status: "success",
//       createdAt: new Date(),
//     };

//     wallet.balance += amount;
//     wallet.transactions.push(transaction);
//     await wallet.save();

//     return NextResponse.json(
//       { success: true, wallet },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error) {
//     console.error("[WALLET_SEND_ERROR]", error);
//     return NextResponse.json(
//       { success: false, message: "Internal server error" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }
