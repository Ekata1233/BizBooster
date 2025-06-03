import { NextResponse } from "next/server"
import Zone from "@/models/Zone"
import { connectToDatabase } from "@/utils/db"

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

// GET /api/zones
export async function GET() {
  try {
    await connectToDatabase()
    const zones = await Zone.find()
    return NextResponse.json({ data: zones }, { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error("Error fetching zones:", error)
    return NextResponse.json({ message: "Server Error" }, { status: 500, headers: corsHeaders })
  }
}
