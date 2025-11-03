import { getAccessToken } from "@/utils/payu";


export default async function handler(req, res) {
  try {
    const data = await getAccessToken();
    // don't send secret fields to frontend in production — only token and expiry
    res.status(200).json({ access_token: data.access_token, expires_in: data.expires_in });
  } catch (err) {
    console.error("token error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to get access token", details: err?.message || err?.response?.data });
  }
}
