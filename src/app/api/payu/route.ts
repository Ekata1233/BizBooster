import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PAYU_KEY = process.env.PAYU_KEY!;
const PAYU_SALT = process.env.PAYU_SALT!;
const PAYU_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://secure.payu.in/_payment"
    : "https://sandboxsecure.payu.in/_payment";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { amount, productinfo, firstname, email, phone } = body;

  if (!amount || !productinfo || !firstname || !email) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const txnid = "TXN" + new Date().getTime();

  const amt = parseFloat(amount).toFixed(2); // e.g., 100.00

const hashString = `${PAYU_KEY}|${txnid}|${amt}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
const hash = crypto.createHash("sha512").update(hashString).digest("hex");


 return NextResponse.json({
  key: PAYU_KEY,
  txnid,
  amount: amt,
  productinfo,
  firstname,
  email,
  phone,
  hash,
  url: PAYU_BASE_URL,
});

}

// Optional: handle other methods to avoid 405
export async function GET() {
  return NextResponse.json({ error: "GET not allowed" }, { status: 405 });
}
