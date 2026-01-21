// src/app/api/provider/route.ts
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import '@/models/Service';
import '@/models/Category';
import Zone from "@/models/Zone";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

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

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const moduleId = searchParams.get("moduleId");

    const providerFilter: any = {
  isApproved: true,
  isDeleted: false,
};

if (moduleId) {
  providerFilter["storeInfo.module"] = moduleId;
}


    let providers: any[] = [];

    if (lat && lng) {
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

      let zoneProviders: any[] = [];
      if (matchedZone) {
        zoneProviders = await Provider.find({
            ...providerFilter,
          "storeInfo.zone": matchedZone._id,
        }).populate([
          {
            path: "subscribedServices",
            select:
              "serviceName price discountedPrice category isDeleted providerCommission",
            populate: { path: "category", select: "name" },
          },
          {
            path: "storeInfo.module", 
            select: "name",               
          },
        ]);
      }

      const panIndiaZone = allZones.find((z) => z.isPanIndia);
      let panIndiaProviders: any[] = [];
      if (panIndiaZone) {
        panIndiaProviders = await Provider.find({
            ...providerFilter,
          "storeInfo.zone": panIndiaZone._id,
        }).populate([
          {
            path: "subscribedServices",
            select:
              "serviceName price discountedPrice category isDeleted providerCommission",
            populate: { path: "category", select: "name" },
          },
          {
            path: "storeInfo.module", 
            select: "name",
          },
        ]);
      }

      providers = [...zoneProviders, ...panIndiaProviders];
    } else {
      providers = await Provider.find(providerFilter)
        .populate([
          {
            path: "subscribedServices",
            select:
              "serviceName price discountedPrice category isDeleted providerCommission",
            populate: { path: "category", select: "name" },
          },
          {
            path: "storeInfo.module",
            select: "name",
          },
        ])
        .sort();
    }

    // after providers are fetched (both lat/lng & else case)

providers = providers.map((provider) => {
  const categorySet = new Set<string>();

  provider.subscribedServices?.forEach((service: any) => {
    if (service.category?.name) {
      categorySet.add(service.category.name);
    }
  });

  return {
    ...provider.toObject(),
    category_list: Array.from(categorySet),
  };
});

return NextResponse.json(providers, { status: 200 });


    // return NextResponse.json(providers, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
