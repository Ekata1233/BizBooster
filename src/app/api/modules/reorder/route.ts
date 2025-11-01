// /api/modules/reorder/route.ts (Next.js App Router)
import { NextResponse } from "next/server";
import Module from "@/models/Module";
import { connectToDatabase } from "@/utils/db";

export async function POST(req: Request) {
  await connectToDatabase();
  const { modules } = await req.json();

  try {
    for (let item of modules) {
      await Module.findByIdAndUpdate(item._id, { sortOrder: item.sortOrder });
    }
    return NextResponse.json({ success: true, message: "Order updated" });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}
