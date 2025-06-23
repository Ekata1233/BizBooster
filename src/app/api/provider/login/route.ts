// src/app/api/provider/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import Provider from "@/models/Provider";
import { z } from "zod";
import { signToken } from "@/utils/auth";
import { connectToDatabase } from "@/utils/db";

const allowedOrigins = [
  'http://localhost:3001',
  'https://biz-booster.vercel.app',
  'http://localhost:3000',
  'https://biz-booster-provider-panel.vercel.app' // ✅ ADD THIS LINE
];
function getCORSHeaders(origin: string) {
  const headers = new Headers();
  if (allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('Access-Control-Allow-Credentials', 'true');
  }
  return headers;
}

// ✅ Preflight CORS support
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const headers = getCORSHeaders(origin);
  return new NextResponse(null, { status: 204, headers });
}

// ✅ Zod schema
const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// ✅ POST login handler
export async function POST(req: NextRequest) {
  await connectToDatabase();

  const origin = req.headers.get("origin") || "";
  const headers = getCORSHeaders(origin);

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.errors },
        { status: 400, headers }
      );
    }

    const { email, password } = parsed.data;

    const provider = await Provider.findOne({ email });

    if (!provider || !(await provider.comparePassword(password))) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401, headers }
      );
    }

    const token = signToken(provider._id.toString());

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          provider,
          token,
        },
      },
      { status: 200, headers }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500, headers }
    );
  }
}
