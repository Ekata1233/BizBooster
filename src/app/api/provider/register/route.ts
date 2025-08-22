// src/app/api/provider/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import Provider from "@/models/Provider";
import { z } from "zod";
import { connectToDatabase } from "@/utils/db";
import { signToken } from "@/utils/auth";
import ProviderWallet from "@/models/ProviderWallet";

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//   'Access-Control-Allow-Credentials': 'true',
// };

// // ✅ Handle preflight
// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }
const allowedOrigins = [
  'http://localhost:3001',
  'https://biz-booster.vercel.app',
  'http://localhost:3000',
  'https://biz-booster-provider-panel.vercel.app' // ✅ ADD THIS LINE
];
function getCorsHeaders(origin: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

// ✅ Handle CORS preflight request
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);
  return new NextResponse(null, { status: 204, headers });
}
const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phoneNo: z.string().min(10),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  try {
    const formData = await req.formData();

    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phoneNo = formData.get("phoneNo") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const parsed = schema.safeParse({ fullName, email, phoneNo, password });
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.errors },
        { status: 400, headers: corsHeaders }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400, headers: corsHeaders }
      );
    }

    const existing = await Provider.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409, headers: corsHeaders }
      );
    }

    const provider = await Provider.create({
      fullName,
      email,
      phoneNo,
      password,
      step1Completed: true,
      registrationStatus: "basic",
    });

    await ProviderWallet.create({
      providerId: provider._id,
      isActive: true,
      balance: 0,
      receivableBalance: 0,
      withdrawableBalance: 0,
      pendingWithdraw: 0,
      alreadyWithdrawn: 0,
      totalEarning: 0,
      totalCredits: 0,
      totalDebits: 0,
      cashInHand: 0,
      transactions: [],
    });

    const token = signToken(provider._id.toString());

    const res = NextResponse.json({ message: "Registered", provider,token  }, { headers: corsHeaders });
    res.cookies.set("token", token, { httpOnly: true, secure: true, sameSite: "none", path: "/" });

    return res;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again later." },
      { status: 500, headers: corsHeaders }
    );
  }
}

