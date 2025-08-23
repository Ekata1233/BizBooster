import { NextResponse } from "next/server";
import Deposite from "@/models/Deposite";
import { connectToDatabase } from "@/utils/db";

type Params = { params: { id: string } };

export async function GET(req: Request, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = params;
    const doc = await Deposite.findById(id);
    if (!doc) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: doc }, { status: 200 });
  } catch (error) {
    console.error("GET /api/deposites/[id] error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await req.json();

    const updates: any = {};
    if (body.packagePrice != null) updates.packagePrice = Number(body.packagePrice);
    if (body.monthlyEarnings != null) updates.monthlyEarnings = Number(body.monthlyEarnings);
    if (body.lockInPeriod != null) updates.lockInPeriod = Number(body.lockInPeriod);
    if (body.deposite != null) updates.deposite = Number(body.deposite);
    if (body.user != null) updates.user = body.user;
    if (body.packageActivateDate != null) updates.packageActivateDate = new Date(body.packageActivateDate);

    const updated = await Deposite.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/deposites/[id] error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = params;
    const removed = await Deposite.findByIdAndDelete(id);
    if (!removed) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/deposites/[id] error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
