// src/app/api/provider/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import '@/models/Service'; // ensure this model is registered

// ─── Allowed Origins for CORS ─────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://biz-booster.vercel.app'
];

function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
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
  const origin = req.headers.get("origin");
  await connectToDatabase();

  const id = req.nextUrl.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing ID parameter." },
      { status: 400, headers: getCorsHeaders(origin) }
    );
  }

  try {
    const provider = await Provider.findById(id).populate('subscribedServices');
    // OR: to include specific fields only:
    // .populate('subscribedServices', 'serviceName price discountedPrice');

    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Provider not found." },
        { status: 404, headers: getCorsHeaders(origin) }
      );
    }

    return NextResponse.json(provider, {
      status: 200,
      headers: getCorsHeaders(origin),
    });
  } catch (error) {
    console.error("Error fetching provider:", error);
    return NextResponse.json(
      { success: false, message: "Server error." },
      { status: 500, headers: getCorsHeaders(origin) }
    );
  }
}


// ─── PUT /api/provider/:id ─────────────────────────────────────────
export async function PUT(req: NextRequest) {
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
  const provider = await Provider.findByIdAndUpdate(id, updates, { new: true });

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
