import axios from "axios";

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
