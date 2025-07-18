// app/api/sme/mark-order-paid/route.ts

import { NextRequest, NextResponse } from "next/server";
import Checkout from "@/models/Checkout";
import { connectToDatabase } from "@/utils/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const order = await User.findById(userId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  order.status = "paid";
  order.paymentConfirmedAt = new Date();
  await order.save();

  return NextResponse.json({ success: true });
}
