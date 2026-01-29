import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import "@/models/Service";
import "@/models/Category";
import Zone from "@/models/Zone";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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
    const categoryId = searchParams.get("categoryId");

    /* ✅ BASE FILTER */
    const baseFilter: any = {
      topRated: true,
      isApproved: true,
      isDeleted: false,
    //   "storeInfo.module": moduleId,
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
            subscribedServices
          `)
          .populate([{
            path: "storeInfo.module",
            select: "name",
          },
  {
    path: "subscribedServices",
    select: "serviceName category",
    populate: {
      path: "category",
      select: "name _id",
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
            subscribedServices
          `)
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
                select: "name _id",
              },
            },
          ]);
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
          subscribedServices
        `)
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
              select: "name _id",
            },
          },
        ]);
    }

    /* 🧼 RESPONSE SHAPE */
    const response = [];
    
    for (const provider of providers) {
      // Check if provider has subscribedServices
      if (!provider.subscribedServices || !Array.isArray(provider.subscribedServices)) {
        continue;
      }

      // If categoryId is provided, check if provider has this category
      if (categoryId) {
        let hasCategory = false;
        let filteredCategoryName = "";
        
        // Check if any subscribed service belongs to the specified category
        for (const service of provider.subscribedServices) {
          const serviceCategoryId = 
            service?.category?._id?.toString() || 
            service?.category?.toString();
          
          if (serviceCategoryId === categoryId) {
            hasCategory = true;
            filteredCategoryName = service?.category?.name || "";
            break;
          }
        }
        
        // Skip provider if doesn't have the requested category
        if (!hasCategory) {
          continue;
        }
        
        // Add provider to response with only the filtered category
        response.push({
          _id: provider._id,
          fullName: provider.fullName,
          phoneNo: provider.phoneNo,
          email: provider.email,
          averageRating: provider.averageRating,
          totalReviews: provider.totalReviews,
          isStoreOpen: provider.isStoreOpen,
          category_list: filteredCategoryName ? [filteredCategoryName] : [],
          storeInfo: {
            storeName: provider.storeInfo?.storeName,
            storePhone: provider.storeInfo?.storePhone,
            storeEmail: provider.storeInfo?.storeEmail,
            module: provider.storeInfo?.module,
            zone: provider.storeInfo?.zone,
            logo: provider.storeInfo?.logo,
            cover: provider.storeInfo?.cover,
            address: provider.storeInfo?.address,
            city: provider.storeInfo?.city,
            state: provider.storeInfo?.state,
            country: provider.storeInfo?.country,
            aboutUs: provider.storeInfo?.aboutUs,
            tags: provider.storeInfo?.tags,
            totalProjects: provider.storeInfo?.totalProjects,
            totalExperience: provider.storeInfo?.totalExperience,
          },
        });
      } else {
        // No category filter - show all categories
        const categorySet = new Set<string>();
        
        provider.subscribedServices?.forEach((service: any) => {
          if (service?.category?.name) {
            categorySet.add(service.category.name);
          }
        });
        
        response.push({
          _id: provider._id,
          fullName: provider.fullName,
          phoneNo: provider.phoneNo,
          email: provider.email,
          averageRating: provider.averageRating,
          totalReviews: provider.totalReviews,
          isStoreOpen: provider.isStoreOpen,
          category_list: Array.from(categorySet),
          storeInfo: {
            storeName: provider.storeInfo?.storeName,
            storePhone: provider.storeInfo?.storePhone,
            storeEmail: provider.storeInfo?.storeEmail,
            module: provider.storeInfo?.module,
            zone: provider.storeInfo?.zone,
            logo: provider.storeInfo?.logo,
            cover: provider.storeInfo?.cover,
            address: provider.storeInfo?.address,
            city: provider.storeInfo?.city,
            state: provider.storeInfo?.state,
            country: provider.storeInfo?.country,
            aboutUs: provider.storeInfo?.aboutUs,
            tags: provider.storeInfo?.tags,
            totalProjects: provider.storeInfo?.totalProjects,
            totalExperience: provider.storeInfo?.totalExperience,
          },
        });
      }
    }


    return NextResponse.json(response, { status: 200, headers : corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, message }, { status: 500 , headers : corsHeaders });
  }
}
