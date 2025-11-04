import { NextResponse } from "next/server";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const { services } = await req.json();

    for (let item of services) {
      await Service.findByIdAndUpdate(item._id, {
        sortOrder: item.sortOrder,
      });
    }

    return NextResponse.json({ success: true, message: "Service order updated" });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}
