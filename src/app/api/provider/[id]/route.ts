// src/app/api/provider/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const provider = await Provider.findById(params.id);
  if (!provider) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(provider);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const updates = await req.json();
  const provider = await Provider.findByIdAndUpdate(params.id, updates, {
    new: true,
  });
  return NextResponse.json(provider);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  await Provider.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Deleted" });
}
