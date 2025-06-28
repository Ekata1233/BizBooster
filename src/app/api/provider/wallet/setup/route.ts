// // app/api/provider/wallet/setup/route.ts

// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/utils/db";
// import ProviderWallet from "@/models/ProviderWallet";
// import { getToken as getCashfreeToken } from "@/utils/cashfree";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function POST(req: Request) {
//   try {
//     await connectToDatabase();
//     const body = await req.json();

//     const { providerId, bankAccount, ifsc, upiId, name, email, phone } = body;

//     if (!providerId || !bankAccount || !ifsc || !name || !email || !phone) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Step 1: Register with Cashfree
//     const beneId = `PROVIDER_${providerId}`;

//     const cashfreeResponse = await fetch("https://payout-api.cashfree.com/payout/v1/addBeneficiary", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${await getCashfreeToken()}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         beneId,
//         name,
//         email,
//         phone,
//         bankAccount,
//         ifsc,
//         address1: "N/A",
//       }),
//     });

//     const result = await cashfreeResponse.json();

//     if (result.status !== "SUCCESS") {
//       return NextResponse.json(
//         { success: false, message: "Cashfree error", result },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Step 2: Save to ProviderWallet
//     await ProviderWallet.findOneAndUpdate(
//       { providerId },
//       {
//         beneficiaryId: beneId,
//         bankAccount,
//         upiId,
//         isActive: true,
//       },
//       { upsert: true, new: true }
//     );

//     return NextResponse.json(
//       { success: true, message: "Bank details saved & registered with Cashfree" },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error) {
//     console.error("[WALLET_SETUP_ERROR]", error);
//     return NextResponse.json(
//       { success: false, message: "Internal server error" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


// app/api/provider/wallet/setup/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import ProviderWallet from "@/models/ProviderWallet";
import { getToken as getCashfreeToken } from "@/utils/cashfree";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 👇 Add this handler to respond to CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { providerId, bankAccount, ifsc, upiId, name, email, phone } = body;

    if (!providerId || !bankAccount || !ifsc || !name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    const beneId = `PROVIDER_${providerId}`;

    const cashfreeResponse = await fetch("https://payout-api.cashfree.com/payout/v1/addBeneficiary", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await getCashfreeToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        beneId,
        name,
        email,
        phone,
        bankAccount,
        ifsc,
        address1: "N/A",
      }),
    });

    const result = await cashfreeResponse.json();

    if (result.status !== "SUCCESS") {
      return NextResponse.json(
        { success: false, message: "Cashfree error", result },
        { status: 400, headers: corsHeaders }
      );
    }

    await ProviderWallet.findOneAndUpdate(
      { providerId },
      {
        beneficiaryId: beneId,
        bankAccount,
        upiId,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      { success: true, message: "Bank details saved & registered with Cashfree" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[WALLET_SETUP_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
