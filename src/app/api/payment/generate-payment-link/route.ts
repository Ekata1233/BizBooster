
// import { NextRequest, NextResponse } from "next/server";
// import axios from "axios";

// const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
// const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;

// // CORS Headers
// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type",
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const { amount, customerId, customerName, customerEmail, customerPhone } = body;

//   try {
//     console.log("Generating Cashfree payment link for:");
//     console.log({ amount, customerId, customerName, customerEmail });

//     const response = await axios.post(
//       "https://sandbox.cashfree.com/pg/orders",
//       {
//         order_amount: amount,
//         order_currency: "INR",
//         customer_details: {
//           customer_id: customerId,
//           customer_name: customerName,
//           customer_email: customerEmail,
//           customer_phone: customerPhone,
//         },
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "x-api-version": "2022-09-01",
//           "x-client-id": process.env.CASHFREE_APP_ID,
//           "x-client-secret": process.env.CASHFREE_SECRET_KEY,
//         },
//       }
//     );

//     console.log("Cashfree response:", response.data);

//     const paymentSessionId = response.data.payment_session_id;
//     const paymentLink = paymentSessionId
//       ? `https://sandbox.cashfree.com/pg/checkout?session_id=${paymentSessionId}`
//       : null;

//     return NextResponse.json(
//       { paymentSessionId, paymentLink },
//       { headers: corsHeaders }
//     )

//   } catch (error: any) {
//     console.error("Cashfree API Error:");
//     if (error.response) {
//       console.error("Status:", error.response.status);
//       console.error("Data:", error.response.data);
//     } else {
//       console.error("Message:", error.message);
//     }

//     return NextResponse.json(
//       { error: "Failed to generate payment link" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { amount, customerId, customerName, customerEmail, customerPhone } = body;

  try {
    console.log("Generating Cashfree payment link using /pg/links for:", {
      amount, customerName, customerEmail, customerPhone
    });

    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/links",
      {
        link_amount: amount,
        link_currency: "INR",
        link_purpose: "Advance payment for home service booking",
        customer_details: {
          customer_id: customerId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        link_notify: {
          send_email: true,
          send_sms: false,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
        },
      }
    );

    const paymentLink = response.data.link_url;

    return NextResponse.json({ paymentLink }, { headers: corsHeaders });

  } catch (error: any) {
    console.error("Cashfree API Error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }

    return NextResponse.json(
      { error: "Failed to generate payment link" },
      { status: 500, headers: corsHeaders }
    );
  }
}
