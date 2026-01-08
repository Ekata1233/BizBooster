import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import "@/models/Service";
import "@/models/Category";
import Zone from "@/models/Zone";

/* 🔁 YOUR ORIGINAL LOGIC – UNCHANGED */
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
    const moduleId = searchParams.get("moduleId");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    console.log("module id : ", moduleId)

    // if (!moduleId) {
    //   return NextResponse.json(
    //     { success: false, message: "moduleId is required" },
    //     { status: 400 }
    //   );
    // }

    /* ✅ BASE FILTER */
    const baseFilter: any = {
      isRecommended: true,
      isApproved: true,
      isDeleted: false,
    };

    if (moduleId) {
  baseFilter["storeInfo.module"] = moduleId;
}

    let providers: any[] = [];

    /* 📍 ZONE + PAN INDIA LOGIC */
    if (lat && lng) {
      const allZones = await Zone.find({ isDeleted: false });

      let matchedZone: any = null;

      for (const zone of allZones) {
        if (
          !zone.isPanIndia &&
          isPointInPolygon(
            { lat: +lat, lng: +lng },
            zone.coordinates
          )
        ) {
          matchedZone = zone;
          break;
        }
      }

      let zoneProviders: any[] = [];

      if (matchedZone) {
        zoneProviders = await Provider.find({
          ...baseFilter,
          "storeInfo.zone": matchedZone._id,
        })
          .select(
            `_id
            fullName
            phoneNo
            email
            averageRating
            totalReviews
            isStoreOpen
            storeInfo
          `
          )
          .populate([
  {
    path: "storeInfo.module",
    select: "name",
  },
  {
    path: "subscribedServices",
    select: "serviceName category",
    populate: {
      path: "category",
      select: "name",
    },
  },
]);

      }

      const panIndiaZone = allZones.find((z) => z.isPanIndia);
      let panIndiaProviders: any[] = [];

      if (panIndiaZone) {
        panIndiaProviders = await Provider.find({
          ...baseFilter,
          "storeInfo.zone": panIndiaZone._id,
        })
          .select(
            `_id
            fullName
            phoneNo
            email
            averageRating
            totalReviews
            isStoreOpen
            storeInfo
          `
          )
          .populate({
            path: "storeInfo.module",
            select: "name",
          });
      }

      providers = [...zoneProviders, ...panIndiaProviders];
    } else {
      /* 🌍 NO LAT/LNG → RETURN ALL MATCHING */
      providers = await Provider.find(baseFilter)
        .select(
          `_id
          fullName
          phoneNo
          email
          averageRating
          totalReviews
          isStoreOpen
          storeInfo
        `
        )
        .populate({
          path: "storeInfo.module",
          select: "name",
        });
    }

const response = providers.map((p) => {
  const categorySet = new Set<string>();

  p.subscribedServices?.forEach((service: any) => {
    if (service?.category?.name) {
      categorySet.add(service.category.name);
    }
  });

  return {
    _id: p._id,
    fullName: p.fullName,
    phoneNo: p.phoneNo,
    email: p.email,
    averageRating: p.averageRating,
    totalReviews: p.totalReviews,
    isStoreOpen: p.isStoreOpen,

    category_list: Array.from(categorySet),

    storeInfo: {
      storeName: p.storeInfo?.storeName,
      storePhone: p.storeInfo?.storePhone,
      storeEmail: p.storeInfo?.storeEmail,
      module: p.storeInfo?.module,
      zone: p.storeInfo?.zone,
      logo: p.storeInfo?.logo,
      cover: p.storeInfo?.cover,
      address: p.storeInfo?.address,
      city: p.storeInfo?.city,
      state: p.storeInfo?.state,
      country: p.storeInfo?.country,
      aboutUs: p.storeInfo?.aboutUs,
      tags: p.storeInfo?.tags,
      totalProjects: p.storeInfo?.totalProjects,
      totalExperience: p.storeInfo?.totalExperience,
    },
  };
});


    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
