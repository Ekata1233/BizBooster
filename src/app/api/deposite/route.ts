import { NextResponse } from "next/server";
import Deposite from "@/models/Deposite";
import { connectToDatabase } from "@/utils/db";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const user = url.searchParams.get("user"); // optional filter by user id

    const query: any = {};
    if (user) query.user = user;

    const deposites = await Deposite.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: deposites }, { status: 200 });
  } catch (error) {
    console.error("GET /api/deposites error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { user, packagePrice, monthlyEarnings, lockInPeriod, deposite, packageActivateDate } = body ?? {};

    if (!user || packagePrice == null || monthlyEarnings == null || lockInPeriod == null || deposite == null) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const created = await Deposite.create({
      user,
      packagePrice: Number(packagePrice),
      monthlyEarnings: Number(monthlyEarnings),
      lockInPeriod: Number(lockInPeriod),
      deposite: Number(deposite),
      packageActivateDate: packageActivateDate ? new Date(packageActivateDate) : null,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/deposites error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
