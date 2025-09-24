import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import TrendingModuleService from "@/models/TrendingModuleService";

const EDUCATIONAL_MODULE_ID = "6822e02de8235364b35df1ae";

export async function GET() {
  await connectToDatabase();
  const services = await TrendingModuleService.find({ moduleId: EDUCATIONAL_MODULE_ID })
    .populate("serviceId")
    .exec();
  return NextResponse.json(services);
}
