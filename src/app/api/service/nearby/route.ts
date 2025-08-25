


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
      if (!zone.isPanIndia && isPointInPolygon({ lat, lng }, zone.coordinates)) {
        matchedZone = zone;
        break;
      }
    }

    // 2️⃣ Get providers in the matched zone (if any)
    let zoneProviders: any[] = [];
    if (matchedZone) {
      zoneProviders = await Provider.find({
        "storeInfo.zone": matchedZone._id,
        isApproved: true,
        isDeleted: false,
      }).populate("subscribedServices");
    }

    // 3️⃣ Get PAN INDIA providers
    const panIndiaZone = allZones.find((z) => z.isPanIndia);
    let panIndiaProviders: any[] = [];
    if (panIndiaZone) {
      panIndiaProviders = await Provider.find({
        "storeInfo.zone": panIndiaZone._id,
        isApproved: true,
        isDeleted: false,
      }).populate("subscribedServices");
    }

    // 4️⃣ Merge services from both sets of providers
    const services: any[] = [];

    const allProviders = [...zoneProviders, ...panIndiaProviders];
    allProviders.forEach((provider) => {
      provider.subscribedServices.forEach((service: any) => {
        services.push(service.toObject ? service.toObject() : service);
      });
    });

    // 5️⃣ Remove duplicates (by service _id)
    const uniqueServices = Array.from(
      new Map(services.map((s) => [s._id.toString(), s])).values()
    );

    // 6️⃣ Return response
    return NextResponse.json(
      {
        success: true,
        zone: matchedZone ? matchedZone.name : "PAN INDIA",
        data: uniqueServices,
      },
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
