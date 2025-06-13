import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import ServiceCustomer from "@/models/ServiceCustomer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ Update a service customer
export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    const formData = await req.formData();

    console.log("customer data for the update : ",formData);

    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const description = formData.get("description") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const country = formData.get("country") as string;

    if (!id || !fullName || !phone || !email || !address || !city || !state || !country) {
      return NextResponse.json(
        { success: false, message: "Missing required fields or ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const updateData = {
      fullName,
      phone,
      email,
      description,
      address,
      city,
      state,
      country,
      isDeleted: false,
    };

    const updatedCustomer = await ServiceCustomer.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCustomer) {
      return NextResponse.json(
        { success: false, message: "ServiceCustomer not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedCustomer },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 400, headers: corsHeaders }
    );
  }
}

// ✅ Soft-delete a service customer
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

    const deletedCustomer = await ServiceCustomer.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedCustomer) {
      return NextResponse.json(
        { success: false, message: "ServiceCustomer not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "ServiceCustomer soft-deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
