import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import TrendingModuleService from "@/models/TrendingModuleService";

export async function POST(req: Request) {
  await connectToDatabase();
  try {
    const { moduleId, serviceId, isTrending } = await req.json();

    if (!moduleId || !serviceId) {
      return NextResponse.json({ error: "moduleId and serviceId are required" }, { status: 400 });
    }

    const newRecord = await TrendingModuleService.create({
      moduleId,
      serviceId,
      isTrending: isTrending || false,
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
// GET all records
export async function GET() {
  await connectToDatabase();
  try {
    const records = await TrendingModuleService.find();
    return NextResponse.json(records, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


// ✅ Update or create if not exists
export async function PATCH(req: Request) {
  await connectToDatabase();
  try {
    const { moduleId, serviceId, isTrending } = await req.json();

    if (!moduleId || !serviceId) {
      return NextResponse.json(
        { error: "moduleId and serviceId are required" },
        { status: 400 }
      );
    }

    const updatedRecord = await TrendingModuleService.findOneAndUpdate(
      { moduleId, serviceId }, // match
      { $set: { isTrending } }, // update only isTrending
      { upsert: true, new: true } // ⚡ upsert: create if not exists
    );

    return NextResponse.json(updatedRecord, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
