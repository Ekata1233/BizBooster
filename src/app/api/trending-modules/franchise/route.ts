import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import TrendingModuleService from "@/models/TrendingModuleService";

const FRANCHISE_MODULE_ID = "68b2caf72ff3f8a31bf7bb8f";

export async function GET() {
  await connectToDatabase();
  const services = await TrendingModuleService.find({ moduleId: FRANCHISE_MODULE_ID , isTrending: true })
    .populate("serviceId")
    .exec();
  return NextResponse.json(services);
}
