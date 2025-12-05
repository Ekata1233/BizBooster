import { NextResponse } from "next/server"
import Zone from "@/models/Zone"
import { connectToDatabase } from "@/utils/db"
import Provider from "@/models/Provider";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const body = await req.json()

    console.log("data of the zone setup : ",body)

    const { name, coordinates } = body

    if (!name || !Array.isArray(coordinates) || coordinates.length < 3) {
      return NextResponse.json(
        { message: "Zone name and at least 3 coordinates are required." },
        { status: 400, headers: corsHeaders }
      )
    }

    const newZone = await Zone.create({ name, coordinates })

    return NextResponse.json(
      { message: "Zone created successfully", data: newZone },
      { status: 201, headers: corsHeaders }
    )
  } catch (error) {
    console.error("Error creating zone:", error)
    return NextResponse.json({ message: "Server Error" }, { status: 500, headers: corsHeaders })
  }
}

// GET /api/zones PRODUCTION 
// export async function GET() {
//   try {
//     await connectToDatabase()
//     const zones = await Zone.find({isDeleted: false});
//     return NextResponse.json({ data: zones }, { status: 200, headers: corsHeaders })
//   } catch (error) {
//     console.error("Error fetching zones:", error)
//     return NextResponse.json({ message: "Server Error" }, { status: 500, headers: corsHeaders })
//   }
// }


//CHANGE 08 OCT 2025
export async function GET() {
  try {
    await connectToDatabase()
    const zones = await Zone.find();

  const providerCounts = await Provider.aggregate([
    { $match: { "storeInfo.zone": { $ne: null } } },
    { $group: { _id: "$storeInfo.zone", count: { $sum: 1 } } },
  ]);

    const countsMap = providerCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {} as Record<string, number>);

    const data = zones.map((zone) => ({
      ...zone.toObject(),
      providerCount: countsMap[zone._id.toString()] || 0,
    }));


    return NextResponse.json({ data }, { status: 200, headers: corsHeaders })

  } catch (error) {
    console.error("Error fetching zones:", error)
    return NextResponse.json({ message: "Server Error" }, { status: 500, headers: corsHeaders })
  }
}