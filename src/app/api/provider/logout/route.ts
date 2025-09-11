import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") || "";

  const allowedOrigins = ['http://localhost:3001', 'https://biz-booster.vercel.app', 'http://localhost:3000',  'https://api.fetchtrue.com'];
  const headers = new Headers();
  if (allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // 🧹 Clear the token cookie
  const response = new NextResponse(
    JSON.stringify({ success: true, message: "Logout successful" }),
    { status: 200, headers }
  );

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0), // Expire the cookie
    path: "/",
  });

  return response;
}

// Optional: CORS preflight handler for logout
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const headers = new Headers();
    const allowedOrigins = ['http://localhost:3001', 'https://biz-booster.vercel.app', 'http://localhost:3000',  'https://api.fetchtrue.com',];


  if (allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return new NextResponse(null, { status: 204, headers });
}
