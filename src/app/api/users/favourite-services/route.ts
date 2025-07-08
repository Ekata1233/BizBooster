import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import "@/models/Service";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}


/* ───────────────────────────────────────────────
 *  DELETE /api/user-favorites/:userId/:serviceId
 * ───────────────────────────────────────────── */
export async function DELETE(req: Request) {
    await connectToDatabase();

}
