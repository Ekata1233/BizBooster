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

// // ─────────────── POST (Add Beneficiary to Cashfree v2) ───────────────
// export async function POST(req: Request) {
//   try {
//     const {
//       token,
//       beneficiary_id,
//       beneficiary_name,
//       email,
//       phone,
//       accountNumber,
//       ifsc,
//     } = await req.json();

//     // Build request body according to Cashfree v2 API
//     const body = {
//       beneficiary_id,
//       beneficiary_name,
//       beneficiary_instrument_details: {
//         bank_account_number: accountNumber,
//         bank_ifsc: ifsc,
//         vpa: "", // optional UPI, leave empty if not used
//       },
//       beneficiary_contact_details: {
//         beneficiary_email: email,
//         beneficiary_phone: phone,
//         beneficiary_country_code: "+91",
//         beneficiary_address: "Bangalore", // static for now
//         beneficiary_city: "Bangalore",
//         beneficiary_state: "Karnataka",
//         beneficiary_postal_code: "560001",
//       },
//     };

//     const res = await fetch(
//       "https://sandbox.cashfree.com/payout/beneficiary", // sandbox URL
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-api-version": "2024-01-01",
//           "x-client-id": process.env.CASHFREE_PAYOUT_ID!,
//           "x-client-secret": process.env.CASHFREE_PAYOUT_SECRET_KEY!,
//         },
//         body: JSON.stringify(body),
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
import mongoose from "mongoose";
import User from "@/models/User"; // adjust the path
import { User as IUserContext } from "@/context/UserContext";
import UserBankDetails from "@/models/UserBankDetails";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

// POST (Add Beneficiary)
export async function POST(req: Request) {
  try {
    const { userId, accountNumber, ifsc, bankName, branchName } = await req.json();

    console.log("Received userId:", userId);
    console.log("Received accountNumber:", accountNumber);
    console.log("Received IFSC:", ifsc);

    if (!userId || !accountNumber || !ifsc) {
      return NextResponse.json(
        { error: "userId, accountNumber, and ifsc are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI!);
    }

    // Fetch user details from DB
    const user = await User.findOne({ _id: userId }).lean() as IUserContext | null;
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const bankDetails = await UserBankDetails.findOneAndUpdate(
      { userId },
      {
        userId,
        accountNumber,
        ifsc,
        bankName: bankName || "Unknown Bank",
        branchName: branchName || "",
        isActive: true,
      },
      { upsert: true, new: true } // creates if not exists, updates otherwise
    );

    // Use user._id as beneficiary_id
    const beneficiary_id = user._id.toString();

    // Build request body according to Cashfree API
    const body = {
      beneficiary_id,
      beneficiary_name: user.fullName,
      beneficiary_instrument_details: {
        bank_account_number: accountNumber,
        bank_ifsc: ifsc,
        vpa: "", // optional UPI
      },
      beneficiary_contact_details: {
        beneficiary_email: user.email,
        beneficiary_phone: user.mobileNumber,
        beneficiary_country_code: "+91",
        beneficiary_address: user.homeAddress?.fullAddress || user.workAddress?.fullAddress || "-",
        beneficiary_city: user.homeAddress?.city || user.workAddress?.city || "-",
        beneficiary_state: user.homeAddress?.state || user.workAddress?.state || "-",
        beneficiary_postal_code: user.homeAddress?.pinCode || user.workAddress?.pinCode || "000000",
      },
    };

    // Call Cashfree API
    const res = await fetch(
      "https://sandbox.cashfree.com/payout/beneficiary",
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

    return NextResponse.json(
      {
        cashfreeResponse: data,
        savedBankDetails: bankDetails,
      },
      {
        status: res.status,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error adding beneficiary:", error);
    return NextResponse.json(
      { error: "Beneficiary add failed", details: error },
      { status: 500, headers: corsHeaders }
    );
  }
}
