// src/app/api/provider/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import Provider from "@/models/Provider";
import { z } from "zod";
import { signToken } from "@/utils/auth";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};


// ✅ Handle preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ errors: parsed.error.errors }, { status: 400,  headers: corsHeaders });

  const { email, password } = parsed.data;
  const provider = await Provider.findOne({ email });
  if (!provider || !(await provider.comparePassword(password)))
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401,  headers: corsHeaders });

  const token = signToken(provider._id.toString());
  const res = NextResponse.json({ message: "Logged in", provider });
  res.cookies.set("token", token, { httpOnly: true, secure: true, path: "/" });
  return res;
}
