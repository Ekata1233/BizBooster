// // src/app/api/provider/login/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import Provider from "@/models/Provider";
// import { z } from "zod";
// import { signToken } from "@/utils/auth";
// import { connectToDatabase } from "@/utils/db";

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
// };


// // ✅ Handle preflight request
// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// const schema = z.object({
//   email: z.string().email(),
//   password: z.string(),
// });

// export async function POST(req: NextRequest) {
//   await connectToDatabase();
//   const body = await req.json();
//   const parsed = schema.safeParse(body);
//   if (!parsed.success)
//     return NextResponse.json({ errors: parsed.error.errors }, { status: 400,  headers: corsHeaders });

//   const { email, password } = parsed.data;
//   const provider = await Provider.findOne({ email });
//   if (!provider || !(await provider.comparePassword(password)))
//     return NextResponse.json({ message: "Invalid credentials" }, { status: 401,  headers: corsHeaders });

//   const token = signToken(provider._id.toString());
//   const res = NextResponse.json({ message: "Logged in", provider });
//   res.cookies.set("token", token, { httpOnly: true, secure: true, path: "/" });
//   return res;
// }
// src/app/api/provider/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import Provider from "@/models/Provider";
import { z } from "zod";
import { signToken } from "@/utils/auth";
import { connectToDatabase } from "@/utils/db";

const allowedOrigins = ['http://localhost:3001', 'https://biz-booster.vercel.app'];

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

// ✅ Preflight request handler
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const headers = getCORSHeaders(origin);
  return new NextResponse(null, { status: 204, headers });
}

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const origin = req.headers.get("origin") || "";
  const headers = getCORSHeaders(origin);

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.errors },
      { status: 400, headers }
    );
  }

  const { email, password } = parsed.data;
  const provider = await Provider.findOne({ email });

  if (!provider || !(await provider.comparePassword(password))) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401, headers }
    );
  }

  const token = signToken(provider._id.toString());

  const response = NextResponse.json(
    { message: "Logged in", provider },
    { status: 200, headers }
  );

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax", // You may set to 'none' for cross-site cookies
    path: "/",
  });

  return response;
}
