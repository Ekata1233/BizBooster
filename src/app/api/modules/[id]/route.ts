// src/app/api/provider/[id]/route.ts
import { NextResponse } from "next/server";
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/** CORS pre-flight */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/** ───── GET /api/provider/:id ───────────────────────────────────────── */
export async function GET(req: Request) {
  await connectToDatabase();

  const id = new URL(req.url).pathname.split("/").pop();
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing ID parameter." },
      { status: 400, headers: corsHeaders }
    );
  }

  const provider = await Provider.findById(id);
  if (!provider) {
    return NextResponse.json(
      { success: false, message: "Provider not found." },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(provider, { status: 200, headers: corsHeaders });
}

/** ───── PUT /api/provider/:id ───────────────────────────────────────── */
export async function PUT(req: Request) {
  await connectToDatabase();

  const id = new URL(req.url).pathname.split("/").pop();
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing ID parameter." },
      { status: 400, headers: corsHeaders }
    );
  }

  // Expecting JSON in the request body
  const updates = await req.json();

  const provider = await Provider.findByIdAndUpdate(id, updates, {
    new: true,
  });

  if (!provider) {
    return NextResponse.json(
      { success: false, message: "Provider not found." },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(provider, { status: 200, headers: corsHeaders });
}

/** ───── DELETE /api/provider/:id ─────────────────────────────────────── */
export async function DELETE(req: Request) {
  await connectToDatabase();

  const id = new URL(req.url).pathname.split("/").pop();
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Missing ID parameter." },
      { status: 400, headers: corsHeaders }
    );
  }

  const deleted = await Provider.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json(
      { success: false, message: "Provider not found." },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    { success: true, message: "Deleted successfully." },
    { status: 200, headers: corsHeaders }
  );
}
