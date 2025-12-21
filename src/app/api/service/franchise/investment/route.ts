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

// ✅ POST: Add/Update investment by size
// export async function POST(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const body = await req.json();
//     const { serviceId, investment } = body;

//      if (!serviceId || !investment || !Array.isArray(investment)) {
//       return NextResponse.json(
//         { success: false, message: "serviceId and investment array required" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     let franchise = await Franchise.findOne({ serviceId });

//     if (!franchise) {
//       franchise = await Franchise.create({
//         serviceId,
//         investment,
//         model: []
//       });

//       return NextResponse.json(
//         { success: true, message: "All investments saved", data: franchise },
//         { status: 201, headers: corsHeaders }
//       );
//     }

//     investment.forEach((inv: any) => {
//       const index = franchise.investment.findIndex(
//         (i: any) => i.franchiseSize === inv.franchiseSize
//       );

//       if (index >= 0) {
//         franchise.investment[index] = inv; // update
//       } else {
//         franchise.investment.push(inv); // insert
//       }
//     });

//     await franchise.save();

//     return NextResponse.json(
//       { success: true, message: "Investment saved/updated", data: franchise },
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
    const { serviceId, investment } = body;

    /* ---------------- VALIDATION ---------------- */
    if (
      !serviceId ||
      !mongoose.Types.ObjectId.isValid(serviceId) ||
      !Array.isArray(investment) ||
      investment.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Valid serviceId & investment array required" },
        { status: 400 }
      );
    }

    /* ---------------- NORMALIZE DATA ---------------- */
    const normalizedInvestment = investment.map(inv => ({
      ...inv,
      franchiseSize: inv.franchiseSize.toLowerCase()
    }));

    /* ---------------- CREATE IF NOT EXISTS ---------------- */
    let franchise = await Franchise.findOne({ serviceId });

    if (!franchise) {
      franchise = await Franchise.create({
        serviceId,
        investment: normalizedInvestment,
        model: []
      });

      return NextResponse.json(
        {
          success: true,
          message: "Franchise created & investments saved",
          data: franchise
        },
        { status: 201 }
      );
    }

    /* ---------------- UPDATE EXISTING SIZES ---------------- */
    for (const inv of normalizedInvestment) {
      await Franchise.updateOne(
        {
          serviceId,
          "investment.franchiseSize": inv.franchiseSize
        },
        {
          $set: {
            "investment.$": inv
          }
        }
      );
    }

    /* ---------------- INSERT ONLY NEW SIZES ---------------- */
   await Franchise.updateOne(
  { serviceId },
  {
    $push: {
      investment: {
        $each: normalizedInvestment.filter(inv =>
          !franchise.investment.some(
            existing => existing.franchiseSize === inv.franchiseSize
          )
        )
      }
    }
  }
);


    /* ---------------- FETCH UPDATED ---------------- */
    franchise = await Franchise.findOne({ serviceId });

    return NextResponse.json(
      {
        success: true,
        message: "Investments saved / updated without duplicates",
        data: franchise
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Investment API Error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Internal Server Error"
      },
      { status: 500 }
    );
  }
}

// GET all investments
export async function GET(req: NextRequest) {
  await connectToDatabase();
  const serviceId = req.nextUrl.searchParams.get("serviceId");

  try {
     const data = await Franchise.findOne(
      { serviceId },
      { model: 0 } // 👈 exclude model field
    );
    return NextResponse.json({ success: true, data }, { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500, headers: corsHeaders });
  }
}
