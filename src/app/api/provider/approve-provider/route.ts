// src/app/api/provider/route.ts
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import { NextResponse } from "next/server";
import '@/models/Service';

export async function GET() {
  await connectToDatabase();
  const providers = await Provider.find({isApproved: true}).sort({ createdAt: -1 }).populate('subscribedServices', 'serviceName price discountedPrice isDeleted');
  return NextResponse.json(providers);
}
