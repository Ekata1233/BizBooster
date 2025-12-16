// src/app/api/provider/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import '@/models/Service';
import '@/models/Category';
import ProviderWallet from "@/models/ProviderWallet";
import Checkout from "@/models/Checkout";
import ServiceMan from "@/models/ServiceMan";

const allowedOrigins = [
  'http://localhost:3001',
  'https://biz-booster.vercel.app',
  'http://localhost:3000',
  'https://api.fetchtrue.com',
  'https://biz-booster-provider-panel.vercel.app', // ✅ ADD THIS LINE
    'https://provider.fetchtrue.com',

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

  // Fetch provider
  const provider = await Provider.findById(id)
    .populate({
      path: "subscribedServices",
      select: "serviceName price discountedPrice category",
      populate: {
        path: "category", 
        select: "name", 
      },
    });
    

  if (!provider) {
    return NextResponse.json(
      { success: false, message: "Provider not found." },
      { status: 404, headers: getCorsHeaders(origin) }
    );
  }

  // Fetch provider wallet
  const wallet = await ProviderWallet.findOne({ providerId: id });

  // Count completed checkouts
  const completedCheckoutsCount = await Checkout.countDocuments({
    provider: id,
    isCompleted: true,
  });

  const servicemenCount = await ServiceMan.countDocuments({ provider: id });
  // Include wallet totalCredits and completed checkouts count
  const response = {
    ...provider.toObject(),
    totalCredits: wallet?.totalCredits || 0,
    pendingWithdraw: wallet?.pendingWithdraw || 0,
    totalCompletedBookings: completedCheckoutsCount,
    totalSubscribedServices: provider.subscribedServices?.length || 0,
    totalServicemen: servicemenCount,
  };

  return NextResponse.json(response, { status: 200, headers: getCorsHeaders(origin) });
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
export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    // 🔹 Soft delete instead of hard delete
    const deletedProvider = await Provider.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedProvider) {
      return NextResponse.json(
        { success: false, message: "Provider not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Provider soft-deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
