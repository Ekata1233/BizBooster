import { NextResponse } from "next/server";
import Zone from "@/models/Zone";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// PUT /api/zones/[id]
export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    const body = await req.json();
    const { name, coordinates } = body;

    console.log("update data of the zone: ", body);
    console.log("id data of the zone: ", id);

if (!id || !name) {
      return NextResponse.json(
        { success: false, message: "Zone ID and name are required." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Construct update data conditionally
    const updateData: any = { name };

    if (Array.isArray(coordinates) && coordinates.length >= 3) {
      updateData.coordinates = coordinates;
    }

    const updatedZone = await Zone.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedZone) {
      return NextResponse.json(
        { success: false, message: "Zone not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedZone },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error updating zone:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE /api/zones/[id]
export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deletedZone = await Zone.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedZone) {
      return NextResponse.json(
        { success: false, message: "Zone not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Zone soft-deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error deleting zone:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

//GET /api/zones/[id]
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const zone = await Zone.findOne({ _id: id, isDeleted: false });

    if (!zone) {
      return NextResponse.json(
        { success: false, message: "Zone not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: zone },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching zone:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}