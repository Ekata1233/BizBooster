// pages/api/generate-payment-link.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { amount, customerId, customerName, customerEmail } = req.body;

  try {
    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      {
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: customerId,
          customer_name: customerName,
          customer_email: customerEmail,
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

    const paymentLink = response.data.payment_session_id
      ? `https://sandbox.cashfree.com/pg/checkout/${response.data.payment_session_id}`
      : null;

    res.status(200).json({ paymentLink });
  } catch (err) {
    console.error("Cashfree Error:", err);
    res.status(500).json({ error: "Failed to generate payment link" });
  }
}
