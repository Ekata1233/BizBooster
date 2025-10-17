import { NextResponse } from "next/server";

/**
 * Type definitions for request body
 */
type Customer = {
  name: string;
  email: string;
  phone: string;
};

type ReqBody = {
  invoiceNumber: string;
  isAmountFilledByCustomer?: boolean;
  subAmount?: number;
  minAmountForCustomer?: number;
  tax?: number;
  shippingCharge?: number;
  discount?: number;
  adjustment?: number;
  description: string;
  source?: string;
  isPartialPaymentAllowed?: boolean;
  currency?: string;
  maxPaymentsAllowed?: number;
  batchId?: string;
  expiryDate?: string;
  scheduledFor?: string;
  customer: Customer;
  viaEmail?: boolean;
  viaSms?: boolean;
  emailTemplateName?: string;
  smsTemplateName?: string;
  timeUnit?: string;
  notes?: string;
  successURL?: string;
  failureURL?: string;
  dropCategory?: string;
  enforcePayMethod?: string;
  enforcePG?: string;
  transactionId?: string;
  validationPeriod?: string;
  smsConfirm?: string;
  isActive?: boolean;
};

const PAYU_ENV = process.env.PAYU_ENV ?? "uat";

const TOKEN_URL =
  PAYU_ENV === "production"
    ? "https://accounts.payu.in/oauth/token"
    : "https://uat-accounts.payu.in/oauth/token";

const PAYMENT_LINK_URL =
  PAYU_ENV === "production"
    ? "https://oneapi.payu.in/payment-links"
    : "https://uat-oneapi.payu.in/payment-links"; // ✅ Correct UAT URL

/**
 * Get Access Token
 */
async function getAccessToken() {
  const clientId = process.env.PAYU_CLIENT_ID;
  const clientSecret = process.env.PAYU_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PAYU_CLIENT_ID or PAYU_CLIENT_SECRET in .env");
  }

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("scope", "create_payment_links");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token request failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (!data.access_token) throw new Error("No access_token found in token response");

  return data.access_token as string;
}

/**
 * POST Route Handler
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;

    // Validation
    if (!body.invoiceNumber)
      return NextResponse.json({ success: false, error: "invoiceNumber is required" }, { status: 400 });

    if (!body.description)
      return NextResponse.json({ success: false, error: "description is required" }, { status: 400 });

    if (!body.customer?.email || !body.customer?.phone)
      return NextResponse.json(
        { success: false, error: "customer email and phone are required" },
        { status: 400 }
      );

    // Get access token
    const token = await getAccessToken();

    // Build payload
    const payload: Record<string, any> = {
      invoiceNumber: body.invoiceNumber,
      isAmountFilledByCustomer: body.isAmountFilledByCustomer ?? false,
      subAmount: body.subAmount ?? 0,
      minAmountForCustomer: body.minAmountForCustomer ?? 0,
      tax: body.tax ?? 0,
      shippingCharge: body.shippingCharge ?? 0,
      discount: body.discount ?? 0,
      adjustment: body.adjustment ?? 0,
      description: body.description,
      source: body.source ?? "API",
      isPartialPaymentAllowed: body.isPartialPaymentAllowed ?? true,
      currency: body.currency ?? "INR",
      maxPaymentsAllowed: body.maxPaymentsAllowed ?? 1,
      batchId: body.batchId ?? "",
      expiryDate: body.expiryDate ?? "",
      scheduledFor: body.scheduledFor ?? "",
      customer: {
        name: body.customer.name,
        email: body.customer.email,
        phone: body.customer.phone,
      },
      viaEmail: body.viaEmail ?? true,
      viaSms: body.viaSms ?? true,
      emailTemplateName: body.emailTemplateName ?? "",
      smsTemplateName: body.smsTemplateName ?? "",
      timeUnit: body.timeUnit ?? "minutes",
      notes: body.notes ?? "",
      successURL: body.successURL ?? "https://yourdomain.com/success",
      failureURL: body.failureURL ?? "https://yourdomain.com/failure",
      dropCategory: body.dropCategory ?? "",
      enforcePayMethod: body.enforcePayMethod ?? "",
      enforcePG: body.enforcePG ?? "",
      transactionId: body.transactionId ?? "",
      validationPeriod: body.validationPeriod ?? "",
      smsConfirm: body.smsConfirm ?? "",
      isActive: body.isActive ?? true,
    };

    // Remove empty fields
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "" || payload[key] === null) delete payload[key];
    });

    console.log("Creating PayU payment link with payload:", payload);

    // Send request to PayU
    const createRes = await fetch(PAYMENT_LINK_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        mid: process.env.PAYU_MERCHANT_KEY ?? "", // ✅ Required header
      },
      body: JSON.stringify(payload),
    });

    if (!createRes.ok) {
      const errorData = await createRes.text();
      console.error("PayU API Error:", errorData);
      return NextResponse.json(
        { success: false, error: JSON.parse(errorData) || "PayU API Error" },
        { status: 500 }
      );
    }

    const data = await createRes.json();

    // Success Response
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("PayU Payment Link Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "fetch failed" },
      { status: 500 }
    );
  }
}
