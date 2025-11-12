import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Provider from "@/models/Provider";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function PATCH(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // extract provider id from URL

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing provider ID parameter." },
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

    // ✅ Fix: coerce value safely
    provider.isStoreOpen = !!provider.isStoreOpen ? false : true;
    await provider.save();

    return NextResponse.json(
      {
        success: true,
        message: `Store is now ${provider.isStoreOpen ? "open" : "closed"}.`,
        isStoreOpen: provider.isStoreOpen,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
