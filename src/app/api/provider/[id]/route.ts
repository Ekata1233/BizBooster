// src/app/api/provider/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import '@/models/Service';

const allowedOrigins = [
  'http://localhost:3001',
  'https://biz-booster.vercel.app',
  'http://localhost:3000',
  'https://api.fetchtrue.com',
  'https://biz-booster-provider-panel.vercel.app' // ✅ ADD THIS LINE
];
function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Referrer-Policy": "no-referrer" // 👈 added here
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}


// ─── CORS Pre-flight ───────────────────────────────────────────────
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

// ─── GET /api/provider/:id ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  await connectToDatabase();

  const origin = req.headers.get("origin");
  const id = req.nextUrl.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing ID parameter." },
      { status: 400, headers: getCorsHeaders(origin) }
    );
  }

  const provider = await Provider.findById(id).populate('subscribedServices', 'serviceName price discountedPrice');
  // .populate('subscribedServices', 'serviceName price discountedPrice');
  if (!provider) {
    return NextResponse.json(
      { success: false, message: "Provider not found." },
      { status: 404, headers: getCorsHeaders(origin) }
    );
  }

  return NextResponse.json(provider, { status: 200, headers: getCorsHeaders(origin) });
}

// ─── PUT /api/provider/:id ─────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  await connectToDatabase();

  const origin = req.headers.get("origin");
  const id = req.nextUrl.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing ID parameter." },
      { status: 400, headers: getCorsHeaders(origin) }
    );
  }

  const updates = await req.json();
  console.log("provider data for the update : ", updates)
  const provider = await Provider.findByIdAndUpdate(
    id,
    { $set: updates }, // ✅ ensures only provided fields are updated
    { new: true, runValidators: true }
  );
  if (!provider) {
    return NextResponse.json(
      { success: false, message: "Provider not found." },
      { status: 404, headers: getCorsHeaders(origin) }
    );
  }

  return NextResponse.json(provider, { status: 200, headers: getCorsHeaders(origin) });
}

// ─── DELETE /api/provider/:id ──────────────────────────────────────
export async function DELETE(req: NextRequest) {
  await connectToDatabase();

  const origin = req.headers.get("origin");
  const id = req.nextUrl.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing ID parameter." },
      { status: 400, headers: getCorsHeaders(origin) }
    );
  }

  const deleted = await Provider.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json(
      { success: false, message: "Provider not found." },
      { status: 404, headers: getCorsHeaders(origin) }
    );
  }

  return NextResponse.json(
    { success: true, message: "Deleted successfully." },
    { status: 200, headers: getCorsHeaders(origin) }
  );
}
