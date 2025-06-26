import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Provider from "@/models/Provider";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(req: NextRequest) {
  await connectToDatabase();
    const url = new URL(req.url);

    const serviceId = url.pathname.split("/").pop();
    
    console.log("serviceId fo the provider : ", serviceId)

  if (!serviceId) {
    return NextResponse.json(
      { success: false, message: "Missing serviceId query parameter." },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const providers = await Provider.find({
      subscribedServices: serviceId,
    });

    return NextResponse.json(
      { success: true, data: providers },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching providers by service ID:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
