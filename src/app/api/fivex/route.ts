// app/api/fivex/route.ts
import { NextResponse } from "next/server";
import FiveXGuarantee from "@/models/FiveXGuarantee";
import { connectToDatabase } from "@/utils/db";

export async function GET() {
  await connectToDatabase();
  const item = await FiveXGuarantee.findOne(); // always return the first (only) document
  return NextResponse.json(item || {});
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { leadcount, fixearning } = body;
  if (typeof leadcount !== "number" || typeof fixearning !== "number") {
    return NextResponse.json(
      { error: "leadcount and fixearning must be numbers" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  // find existing doc, or create new if none
  const updated = await FiveXGuarantee.findOneAndUpdate(
    {}, // match first document
    { $set: { leadcount, fixearning } },
    { new: true, upsert: true } // upsert: true → insert if not exists
  );

  return NextResponse.json(updated, { status: 200 });
}
