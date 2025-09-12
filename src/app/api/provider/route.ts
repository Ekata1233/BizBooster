// src/app/api/provider/route.ts
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import '@/models/Service';
import '@/models/Category';
import Zone from "@/models/Zone";

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

// export async function GET() {
//   await connectToDatabase();
//   const providers = await Provider.find().sort().populate({
//       path: 'subscribedServices',
//       select: 'serviceName price discountedPrice category isDeleted providerCommission',
//       populate: {
//         path: 'category',
//         select: 'name' // Only get the category name
//       }
//     });
//   return NextResponse.json(providers);
// }


export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    let providers: any[] = [];

    if (lat && lng) {
      // ─────────────── Zone-based logic ───────────────
      const allZones = await Zone.find({ isDeleted: false });
      let matchedZone: any = null;

      for (const zone of allZones) {
        if (
          !zone.isPanIndia &&
          isPointInPolygon({ lat: +lat, lng: +lng }, zone.coordinates)
        ) {
          matchedZone = zone;
          break;
        }
      }

      // Providers in matched zone
      let zoneProviders: any[] = [];
      if (matchedZone) {
        zoneProviders = await Provider.find({
          "storeInfo.zone": matchedZone._id,
          isApproved: true,
          isDeleted: false,
        }).populate({
          path: "subscribedServices",
          select:
            "serviceName price discountedPrice category isDeleted providerCommission",
          populate: { path: "category", select: "name" },
        });
      }

      // Providers in PAN INDIA
      const panIndiaZone = allZones.find((z) => z.isPanIndia);
      let panIndiaProviders: any[] = [];
      if (panIndiaZone) {
        panIndiaProviders = await Provider.find({
          "storeInfo.zone": panIndiaZone._id,
          isApproved: true,
          isDeleted: false,
        }).populate({
          path: "subscribedServices",
          select:
            "serviceName price discountedPrice category isDeleted providerCommission",
          populate: { path: "category", select: "name" },
        });
      }

      providers = [...zoneProviders, ...panIndiaProviders];
    } else {
      // ─────────────── Fallback: get all providers ───────────────
      providers = await Provider.find()
        .populate({
          path: "subscribedServices",
          select:
            "serviceName price discountedPrice category isDeleted providerCommission",
          populate: { path: "category", select: "name" },
        })
        .sort();
    }

    return NextResponse.json( providers, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}