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
import ProviderBankDetails from "@/models/ProviderBankDetails";
import Provider, { ProviderDocument } from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";

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
// export async function POST(req: Request) {
//   try {
//     const { providerId, accountNumber, ifsc, bankName, branchName } = await req.json();

//     console.log("Received providerId:", providerId);
//     console.log("Received accountNumber:", accountNumber);
//     console.log("Received IFSC:", ifsc);

//     if (!providerId || !accountNumber || !ifsc) {
//       return NextResponse.json(
//         { error: "providerId, accountNumber, and ifsc are required" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Connect to MongoDB if not already connected
//     if (mongoose.connection.readyState === 0) {
//       await mongoose.connect(process.env.MONGO_URI!);
//     }

//     // Fetch user details from DB
//     const provider = await Provider.findOne({ _id: providerId }).lean() as ProviderDocument | null;
//     if (!provider) {
//       return NextResponse.json(
//         { error: "Provider not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     const bankDetails = await ProviderBankDetails.findOneAndUpdate(
//       { providerId },
//       {
//         providerId,
//         accountNumber,
//         ifsc,
//         bankName: bankName || "Unknown Bank",
//         branchName: branchName || "",
//         isActive: true,
//       },
//       { upsert: true, new: true } // creates if not exists, updates otherwise
//     );

//     // Use user._id as beneficiary_id
//     const beneficiary_id = provider._id.toString();
//     const body = {
//       beneficiary_id,
//       beneficiary_name: provider.fullName,
//       beneficiary_instrument_details: {
//         bank_account_number: accountNumber,
//         bank_ifsc: ifsc,
//         vpa: "", // optional UPI
//       },
//       beneficiary_contact_details: {
//         beneficiary_email: provider.email,
//         beneficiary_phone: provider.phoneNo,
//         beneficiary_country_code: "+91",
//         beneficiary_address:  provider.storeInfo?.address || "",
//         beneficiary_city: provider.storeInfo?.city || "",
//         beneficiary_state: provider.storeInfo?.state || "",
//         beneficiary_postal_code: provider.storeInfo?.postalCode || "000000",
//       },
//     };

//     // Call Cashfree API
//     const res = await fetch(
//       "https://sandbox.cashfree.com/payout/beneficiary",
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

//     return NextResponse.json(
//       {
//         cashfreeResponse: data,
//         savedBankDetails: bankDetails,
//       },
//       {
//         status: res.status,
//         headers: corsHeaders,
//       }
//     );
//   } catch (error) {
//     console.error("Error adding beneficiary:", error);
//     return NextResponse.json(
//       { error: "Beneficiary add failed", details: error },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

export async function POST(req: Request) {
  try {
    const { providerId, accountNumber, ifsc, bankName, branchName } = await req.json();

    console.log("Received data:", { providerId, accountNumber, ifsc, bankName, branchName });

    // Validate required fields
    if (!providerId || !accountNumber || !ifsc) {
      return NextResponse.json(
        { success: false, message: "providerId, accountNumber, and ifsc are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Ensure DB connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI!);
    }

    // Check if provider exists
    const provider = await Provider.findById(providerId).lean();
    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Provider not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Upsert bank details
    const bankDetails = await ProviderBankDetails.findOneAndUpdate(
      { providerId },
      {
        providerId,
        accountNumber,
        ifsc,
        bankName: bankName || "Unknown Bank",
        branchName: branchName || "",
        isActive: true,
        updatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Bank details saved successfully",
        savedBankDetails: bankDetails,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error adding bank details:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save bank details",
        error: error?.message || error,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}


export async function GET() {
  try {
    await connectToDatabase()
    const bankDetails = await ProviderBankDetails.find()
    return NextResponse.json({ data: bankDetails }, { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error("Error fetching bankDetails:", error)
    return NextResponse.json({ message: "Server Error" }, { status: 500, headers: corsHeaders })
  }
}