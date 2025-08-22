// // src/app/api/cashfree/add-beneficiary/route.ts
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

// // ─────────────── POST (Add Beneficiary to Cashfree) ───────────────
// export async function POST(req: Request) {
//   try {
//     const {
//       token,
//       beneId,
//       name,
//       email,
//       phone,
//       ifsc,
//       accountNumber,
//     } = await req.json();

//     const res = await fetch(
//       "https://payout-gamma.cashfree.com/payout/v1/addBeneficiary",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           beneId,
//           name,
//           email,
//           phone,
//           bankAccount: accountNumber,
//           ifsc,
//           address1: "Bangalore", // ✅ static values for now
//           city: "Bangalore",
//           state: "Karnataka",
//           pincode: "560001",
//         }),
//       }
//     );

//     const data = await res.json();

//     return NextResponse.json(data, {
//       status: res.status,
//       headers: corsHeaders,
//     });
//   } catch (error) {
//     console.error("Error adding beneficiary:", error);
//     return NextResponse.json(
//       { error: "Beneficiary add failed", details: error },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


// src/app/api/cashfree/add-beneficiary/route.ts
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ─────────────── OPTIONS (CORS preflight) ───────────────
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

// ─────────────── POST (Add Beneficiary to Cashfree v2) ───────────────
export async function POST(req: Request) {
  try {
    const {
      token,
      beneficiary_id,
      beneficiary_name,
      email,
      phone,
      accountNumber,
      ifsc,
    } = await req.json();

    // Build request body according to Cashfree v2 API
    const body = {
      beneficiary_id,
      beneficiary_name,
      beneficiary_instrument_details: {
        bank_account_number: accountNumber,
        bank_ifsc: ifsc,
        vpa: "", // optional UPI, leave empty if not used
      },
      beneficiary_contact_details: {
        beneficiary_email: email,
        beneficiary_phone: phone,
        beneficiary_country_code: "+91",
        beneficiary_address: "Bangalore", // static for now
        beneficiary_city: "Bangalore",
        beneficiary_state: "Karnataka",
        beneficiary_postal_code: "560001",
      },
    };

    const res = await fetch(
      "https://sandbox.cashfree.com/payout/beneficiary", // sandbox URL
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2024-01-01",
          "x-client-id": process.env.CASHFREE_PAYOUT_ID!,
          "x-client-secret": process.env.CASHFREE_PAYOUT_SECRET_KEY!,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    return NextResponse.json(data, {
      status: res.status,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error adding beneficiary:", error);
    return NextResponse.json(
      { error: "Beneficiary add failed", details: error },
      { status: 500, headers: corsHeaders }
    );
  }
}
