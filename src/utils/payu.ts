// lib/payu.js
import axios from "axios";

const PAYU_UAT_BASE = "https://uatoneapi.payu.in/payout"; // sandbox base
const PAYU_OAUTH = "https://uatoneapi.payu.in/oauth/token"; // token endpoint

export async function getAccessToken() {
  const clientId = process.env.PAYU_PAYOUTS_CLIENT_ID;
  const clientSecret = process.env.PAYU_PAYOUTS_CLIENT_SECRET;

  if (!clientId || !clientSecret) throw new Error("Missing PayU credentials");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "payouts" // adjust if PayU requires different scope
  });

  const resp = await axios.post(PAYU_OAUTH, body.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  // resp.data.access_token and resp.data.expires_in
  return resp.data;
}

export function payoutHeaders(accessToken) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
  // If your PayU account requires a payoutMerchantId header:
  if (process.env.PAYU_PAYOUTS_MERCHANT_ID) {
    headers.payoutmerchantid = process.env.PAYU_PAYOUTS_MERCHANT_ID;
  }
  return headers;
}

export const PAYU_UAT_BASE_URL = PAYU_UAT_BASE;
