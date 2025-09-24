import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import TrendingModuleService from "@/models/TrendingModuleService";

const MARKETING_MODULE_ID = "6822dfd5e8235364b35df1a2";

export async function GET() {
  await connectToDatabase();
  const services = await TrendingModuleService.find({ moduleId: MARKETING_MODULE_ID })
    .populate("serviceId")
    .exec();
  return NextResponse.json(services);
}
