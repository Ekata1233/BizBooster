// app/api/fivex/[id]/route.ts
import { NextResponse } from "next/server";
import FiveXGuarantee from "@/models/FiveXGuarantee";
import { connectToDatabase } from "@/utils/db";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  await connectToDatabase();
  const item = await FiveXGuarantee.findById(params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(request: Request, { params }: Params) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const updates: any = {};
  if (body.leadcount !== undefined) {
    if (typeof body.leadcount !== "number") return NextResponse.json({ error: "leadcount must be a number" }, { status: 400 });
    updates.leadcount = body.leadcount;
  }
  if (body.fixearning !== undefined) {
    if (typeof body.fixearning !== "number") return NextResponse.json({ error: "fixearning must be a number" }, { status: 400 });
    updates.fixearning = body.fixearning;
  }

  await connectToDatabase();
  const updated = await FiveXGuarantee.findByIdAndUpdate(params.id, { $set: updates }, { new: true });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  await connectToDatabase();
  const deleted = await FiveXGuarantee.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
