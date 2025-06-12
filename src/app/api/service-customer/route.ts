import { NextRequest, NextResponse } from "next/server";
import ServiceCustomer from "@/models/ServiceCustomer";
import { connectToDatabase } from "@/utils/db";
import User from "@/models/User";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Create a new service customer
export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    console.log("customer data : ", formData)

    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const country = formData.get("country") as string;
     const userId = formData.get("userId") as string;

if (!fullName) {
      return NextResponse.json(
        { success: false, message: "Full name is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!city) {
      return NextResponse.json(
        { success: false, message: "City is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!state) {
      return NextResponse.json(
        { success: false, message: "State is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!country) {
      return NextResponse.json(
        { success: false, message: "Country is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const newCustomer = await ServiceCustomer.create({
      fullName,
      phone,
      email,
      address,
      city,
      state,
      country,
      user: userId 
    });

    await User.findByIdAndUpdate(userId, {
      $push: { serviceCustomers : newCustomer._id },
    });

    return NextResponse.json(
      { success: true, data: newCustomer },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 400, headers: corsHeaders }
    );
  }
}

// ✅ Get all service customers with optional search
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const filter: {
      $or?: { [key: string]: { $regex: string; $options: string } }[];
    } = {};

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { city: searchRegex },
      ];
    }

    const customers = await ServiceCustomer.find(filter).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: customers },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
