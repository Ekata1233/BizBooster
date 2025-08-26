// import { NextRequest, NextResponse } from "next/server";
// import mongoose from "mongoose";
// import Provider from "@/models/Provider";
// import { connectToDatabase } from "@/utils/db";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function POST(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const body = await req.json();
//     const { providerId, serviceId } = body;

//     console.log("Unsubscribe request data:", body);

//     if (
//       !providerId ||
//       !serviceId ||
//       !mongoose.Types.ObjectId.isValid(providerId) ||
//       !mongoose.Types.ObjectId.isValid(serviceId)
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Invalid or missing providerId/serviceId" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const provider = await Provider.findById(providerId);

//     if (!provider) {
//       return NextResponse.json(
//         { success: false, message: "Provider not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     if (!provider.subscribedServices?.includes(serviceId)) {
//       return NextResponse.json(
//         { success: false, message: "Service not found in subscription list" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Remove the serviceId from the subscribedServices array
//     provider.subscribedServices = provider.subscribedServices.filter(
//       (id: string) => id.toString() !== serviceId
//     );

//     await provider.save();

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Service unsubscribed successfully",
//         subscribedServices: provider.subscribedServices.map(String),
//       },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     const err = error as Error;
//     console.error("Unsubscribe error:", err.message);
//     return NextResponse.json(
//       { success: false, message: err.message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Provider from "@/models/Provider";
import Service from "@/models/Service"; // ⬅ Added to remove providerPrices
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const body = await req.json();
    const { providerId, serviceId } = body;

    console.log("Unsubscribe request data:", body);

    if (
      !providerId ||
      !serviceId ||
      !mongoose.Types.ObjectId.isValid(providerId) ||
      !mongoose.Types.ObjectId.isValid(serviceId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing providerId/serviceId" },
        { status: 400, headers: corsHeaders }
      );
    }

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Provider not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    if (!provider.subscribedServices?.includes(serviceId)) {
      return NextResponse.json(
        { success: false, message: "Service not found in subscription list" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1️⃣ Remove the serviceId from provider.subscribedServices
    provider.subscribedServices = provider.subscribedServices.filter(
      (id: string) => id.toString() !== serviceId
    );
    await provider.save();

    // 2️⃣ Remove providerPrices entry from the Service document
    const service = await Service.findById(serviceId);
    if (service) {
      const beforeCount = service.providerPrices.length;

      service.providerPrices = service.providerPrices.filter(
        (p: any) => p.provider.toString() !== providerId
      );

      if (service.providerPrices.length !== beforeCount) {
        await service.save();
        console.log(`Removed provider ${providerId} from providerPrices of service ${serviceId}`);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Service unsubscribed successfully",
        subscribedServices: provider.subscribedServices.map(String),
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Unsubscribe error:", err.message);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
