


import { NextResponse } from "next/server";
import Zone from "@/models/Zone";
import Provider from "@/models/Provider";
import "@/models/Service";
import { connectToDatabase } from "@/utils/db";

// ─────────────── Helpers ───────────────
function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: { lat: number; lng: number }[]
) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng,
      yi = polygon[i].lat;
    const xj = polygon[j].lng,
      yj = polygon[j].lat;

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ─────────────── API ───────────────
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { lat, lng } = await req.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, message: "Latitude & Longitude are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1️⃣ Find which zone the user location falls into
    const allZones = await Zone.find({ isDeleted: false });
    let matchedZone: any = null;

    for (const zone of allZones) {
      if (isPointInPolygon({ lat, lng }, zone.coordinates)) {
        matchedZone = zone;
        break;
      }
    }

    if (!matchedZone) {
      return NextResponse.json(
        { success: false, message: "No services available in this location" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 2️⃣ Get all providers in this zone
    const providers = await Provider.find({
      "storeInfo.zone": matchedZone._id,
      isApproved: true,
      isDeleted: false,
    }).populate("subscribedServices");

    if (!providers.length) {
      return NextResponse.json(
        {
          success: true,
          zone: matchedZone.name,
          data: [],
          message: "No services found in this zone",
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // 3️⃣ Collect all services
    const services: any[] = [];
    providers.forEach((provider: any) => {
      provider.subscribedServices.forEach((service: any) => {
        services.push(service.toObject ? service.toObject() : service);
      });
    });

    // 4️⃣ Remove duplicates (by service _id)
    const uniqueServices = Array.from(
      new Map(services.map((s) => [s._id.toString(), s])).values()
    );

    // 5️⃣ Return FULL service documents
    return NextResponse.json(
      { success: true, data: uniqueServices },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching providers by location:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
