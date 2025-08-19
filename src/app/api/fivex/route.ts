// app/api/fivex/route.ts
import { NextResponse } from "next/server";
import FiveXGuarantee from "@/models/FiveXGuarantee";
import { connectToDatabase } from "@/utils/db";

export async function GET() {
  await connectToDatabase();
  const items = await FiveXGuarantee.find().sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { leadcount, fixearning } = body;
  if (typeof leadcount !== "number" || typeof fixearning !== "number") {
    return NextResponse.json({ error: "leadcount and fixearning must be numbers" }, { status: 400 });
  }

  await connectToDatabase();
  const created = await FiveXGuarantee.create({ leadcount, fixearning });
  return NextResponse.json(created, { status: 201 });
}
