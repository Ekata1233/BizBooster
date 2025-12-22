import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Franchise from "@/models/ExtraService";
import mongoose from "mongoose";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

// ✅ POST: Add or update model by size
// export async function POST(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const body = await req.json();
//     const { serviceId, model } = body;

//   if (!serviceId || !Array.isArray(model) || model.length === 0) {
//       return NextResponse.json(
//         { success: false, message: "serviceId & model array required" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     let franchise = await Franchise.findOne({ serviceId });

//     if (!franchise) {
//       // Create first entry
//       franchise = await Franchise.create({
//         serviceId,
//         investment: [],
//         model: model // directly save the full model array
//       });

//       return NextResponse.json(
//         { success: true, message: "Models saved", data: franchise },
//         { status: 201, headers: corsHeaders }
//       );
//     }

//     // Update or add models by size
//     model.forEach((newModel: any) => {
//       const index = franchise.model.findIndex(
//         (m: any) => m.franchiseSize === newModel.franchiseSize
//       );

//       if (index >= 0) {
//         franchise.model[index] = newModel; // update existing
//       } else {
//         franchise.model.push(newModel); // add new
//       }
//     });

//     await franchise.save();

//     return NextResponse.json(
//       { success: true, message: "Model saved/updated", data: franchise },
//       { status: 200, headers: corsHeaders }
//     );

//   } catch (err: any) {
//     return NextResponse.json(
//       { success: false, message: err.message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }
export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const body = await req.json();
    const { serviceId, model } = body;

    if (
      !serviceId ||
      !mongoose.Types.ObjectId.isValid(serviceId) ||
      !Array.isArray(model) ||
      model.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Valid serviceId & model array required" },
        { status: 400 }
      );
    }

    /* ---------- NORMALIZE ---------- */
    const normalizedModel = model.map(m => ({
      ...m,
      franchiseSize: m.franchiseSize.toLowerCase()
    }));

    let franchise = await Franchise.findOne({ serviceId });

    /* ---------- CREATE ---------- */
    if (!franchise) {
      franchise = await Franchise.create({
        serviceId,
        model: normalizedModel,
        investment: []
      });

      return NextResponse.json(
        { success: true, message: "Franchise created", data: franchise },
        { status: 201 }
      );
    }

    /* ---------- 🔥 FIXED UPDATE ---------- */
    await Franchise.updateOne(
      { serviceId },
      {
        $set: {
          model: normalizedModel // 👈 FULL REPLACE
        }
      }
    );

    franchise = await Franchise.findOne({ serviceId });

    return NextResponse.json(
      {
        success: true,
        message: "Models updated correctly",
        data: franchise
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// GET models
export async function GET(req: NextRequest) {
  await connectToDatabase();
  const serviceId = req.nextUrl.searchParams.get("serviceId");

  try {
    const data = await Franchise.findOne({ serviceId },{ investment: 0 });
    return NextResponse.json({ success: true, data }, { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500, headers: corsHeaders });
  }
}
