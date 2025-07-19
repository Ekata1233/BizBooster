// src/app/api/provider/route.ts
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import { NextResponse } from "next/server";
import '@/models/Service';
import '@/models/Category';

export async function GET() {
  await connectToDatabase();
  const providers = await Provider.find().sort().populate({
      path: 'subscribedServices',
      select: 'serviceName price discountedPrice category isDeleted',
      populate: {
        path: 'category',
        select: 'name' // Only get the category name
      }
    });
  return NextResponse.json(providers);
}
