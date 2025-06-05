// // pages/api/provider/subscribe.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { connectToDatabase } from '@/utils/db'; // Your db connection util
// import Provider from '@/models/Provider'; // Your mongoose Provider model
// import mongoose from 'mongoose';

// type Data = {
//     success: boolean;
//     message?: string;
//     subscribedServices?: string[];
// };

// export default async function handler(
//     req: NextApiRequest,
//     res: NextApiResponse<Data>
// ) {
//     if (req.method !== 'POST') {
//         return res.status(405).json({ success: false, message: 'Method not allowed' });
//     }

//     const { providerId, serviceId } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(providerId) || !mongoose.Types.ObjectId.isValid(serviceId)) {
//         return res.status(400).json({ success: false, message: 'Invalid provider or service ID' });
//     }

//     try {
//         await connectToDatabase();

//         const provider = await Provider.findById(providerId);

//         if (!provider) {
//             return res.status(404).json({ success: false, message: 'Provider not found' });
//         }

//         // Avoid duplicate subscription
//         if (provider.subscribedServices?.includes(serviceId)) {
//             return res.status(400).json({ success: false, message: 'Already subscribed to this service' });
//         }

//         provider.subscribedServices = provider.subscribedServices || [];
//         provider.subscribedServices.push(serviceId);

//         await provider.save();

//         return res.status(200).json({ success: true, subscribedServices: provider.subscribedServices.map(id => id.toString()) });
//     } catch (error) {
//         console.error('Subscribe error:', error);
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// }

// pages/api/provider/subscribe.ts or app/api/provider/subscribe/route.ts (depending on your folder structure)
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Provider from "@/models/Provider";
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

    console.log("data of the subscribe : ", body);

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

    if (provider.subscribedServices?.includes(serviceId)) {
      return NextResponse.json(
        { success: false, message: "Service already subscribed" },
        { status: 400, headers: corsHeaders }
      );
    }

    provider.subscribedServices = provider.subscribedServices || [];
    provider.subscribedServices.push(serviceId);
    await provider.save();

    return NextResponse.json(
      { success: true, subscribedServices: provider.subscribedServices.map(String) },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

