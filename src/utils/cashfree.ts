import axios from "axios";
// utils/cashfree.ts

interface CashfreeTokenResponse {
  status: string;
  subCode: string;
  message: string;
  data: {
    token: string;
    expiry: number;
  };
}

interface PayoutResponse {
  status: "SUCCESS" | "ERROR" | "PENDING";
  subCode: string;
  message: string;
  data?: any; // You can replace `any` with a more specific type based on actual API
}


const BASE_URL =
  process.env.CASHFREE_ENVIRONMENT === "TEST"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export const createCashfreeOrder = async (orderData: any) => {
  const response = await axios.post(`${BASE_URL}/orders`, orderData, {
    headers: {
      "x-api-version": "2022-09-01",
      "Content-Type": "application/json",
      "x-client-id": process.env.CASHFREE_APP_ID!,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
    },
  });

  return response.data;
};


// export async function getToken(): Promise<string> {
//   console.log("DEBUG: CASHFREE_APP_ID:", process.env.CASHFREE_APP_ID);
//   console.log("DEBUG: CASHFREE_SECRET_KEY:", process.env.CASHFREE_SECRET_KEY);

// const res = await axios.post("https://payout-api.cashfree.com/payout/v1/authorize", {}, {
//     headers: {
//       "content-type": "application/json",
//       "x-cashfree-client-id": process.env.CASHFREE_APP_ID!,
//       "x-cashfree-client-secret": process.env.CASHFREE_SECRET_KEY!,
//     },
//   });

//   const data: CashfreeTokenResponse = res.data;

//   if (data.status !== "SUCCESS" || !data.data?.token) {
//     throw new Error(`Failed to get Cashfree token: ${data.message}`);
//   }

//   return data.data.token;
// }

const PAYOUT_BASE_URL =
  process.env.CASHFREE_ENVIRONMENT === "TEST"
    // ? "https://payout-gamma.cashfree.com/payout/v1/authorize"
    ? "https://payout-api.cashfree.com/payout/v1/authorize"
    : "https://payout-api.cashfree.com/payout/v1/authorize";

export async function getToken(): Promise<string> {
  console.log("DEBUG: CASHFREE_APP_ID:", process.env.CASHFREE_PAYOUT_ID);
  console.log("DEBUG: CASHFREE_SECRET_KEY:", process.env.CASHFREE_PAYOUT_SECRET_KEY);
  console.log("DEBUG: PAYOUT_BASE_URL:", PAYOUT_BASE_URL);

  try {
    const headers =
      process.env.CASHFREE_ENVIRONMENT === "TEST"
        ? {
            "X-Client-Id": process.env.CASHFREE_APP_ID ?? "",
            "X-Client-Secret": process.env.CASHFREE_SECRET_KEY ?? "",
            "Content-Type": "application/json",
          }
        : {
            "x-cashfree-client-id": process.env.CASHFREE_APP_ID ?? "",
            "x-cashfree-client-secret": process.env.CASHFREE_SECRET_KEY ?? "",
            "content-type": "application/json",
          };

    const response = await axios.post(PAYOUT_BASE_URL, {}, { headers });

    const data = response.data;

    if (data.status !== "SUCCESS" || !data.data?.token) {
      throw new Error(`Failed to get Cashfree token: ${data.message}`);
    }

    return data.data.token;
  } catch (err: any) {
    console.error("CASHFREE_TOKEN_ERROR", err.response?.data || err.message);
    throw new Error(
      `Failed to get Cashfree token: ${
        err.response?.data?.message || err.message
      }`
    );
  }
}

export async function sendPayout(
  beneId: string,
  amount: number
): Promise<PayoutResponse> {
  const token = await getToken();

  const response = await fetch("https://payout-api.cashfree.com/payout/v1/requestTransfer", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      beneId,
      amount,
      transferId: `TXN_${Date.now()}`,
      transferMode: "banktransfer", // Can be changed to "upi", "paytm" etc.
      remarks: "Withdrawal from wallet",
    }),
  });

  const data: PayoutResponse = await response.json();
  return data;
}
