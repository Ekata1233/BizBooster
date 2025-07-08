import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import User from "@/models/User";
import "@/models/Provider";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}


/* ───────────────────────────────────────────────
 *  DELETE method for the remove the provider from the favourite
 * ───────────────────────────────────────────── */
export async function DELETE(req: Request) {
    await connectToDatabase();

}
