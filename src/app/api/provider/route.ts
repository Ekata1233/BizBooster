// src/app/api/provider/route.ts
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET() {
  await connectToDatabase();
  const providers = await Provider.find().sort({ createdAt: -1 });
  return NextResponse.json(providers);
}
