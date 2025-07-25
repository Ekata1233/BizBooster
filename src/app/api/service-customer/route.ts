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
// export async function POST(req: Request) {
//   await connectToDatabase();

//   try {
//     const formData = await req.formData();

//     console.log("customer data : ", formData)

//     const fullName = formData.get("fullName") as string;
//     const phone = formData.get("phone") as string;
//     const email = formData.get("email") as string;
//     const description = formData.get("description") as string;
//     const address = formData.get("address") as string;
//     const city = formData.get("city") as string;
//     const state = formData.get("state") as string;
//     const country = formData.get("country") as string;
//     const user = formData.get("user") as string;

//     if (!fullName) {
//       return NextResponse.json(
//         { success: false, message: "Full name is required." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     if (!phone) {
//       return NextResponse.json(
//         { success: false, message: "Phone number is required." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     if (!email) {
//       return NextResponse.json(
//         { success: false, message: "Email is required." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     if (!address) {
//       return NextResponse.json(
//         { success: false, message: "Address is required." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     if (!city) {
//       return NextResponse.json(
//         { success: false, message: "City is required." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     if (!state) {
//       return NextResponse.json(
//         { success: false, message: "State is required." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     if (!country) {
//       return NextResponse.json(
//         { success: false, message: "Country is required." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "User ID is required." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const newCustomer = await ServiceCustomer.create({
//       fullName,
//       phone,
//       email,
//       description,
//       address,
//       city,
//       state,
//       country,
//       user: user
//     });

//     await User.findByIdAndUpdate(user, {
//       $push: { serviceCustomers: newCustomer._id },
//     });

//     return NextResponse.json(
//       { success: true, data: newCustomer },
//       { status: 201, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     if (error.code === 11000) {
//       const duplicateField = Object.keys(error.keyPattern)[0];
//       const message =
//         duplicateField === "phone"
//           ? "Phone number already exists for this user."
//           : duplicateField === "email"
//             ? "Email already exists for this user."
//             : "Duplicate value.";

//       return NextResponse.json(
//         { success: false, message },
//         { status: 409, headers: corsHeaders }
//       );
//     }

//     const message = error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json(
//       { success: false, message },
//       { status: 400, headers: corsHeaders }
//     );
//   }

// }


export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const description = formData.get("description") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const country = formData.get("country") as string;
    const user = formData.get("user") as string;

    // Validation
    if (!fullName || !phone || !email || !address || !city || !state || !country || !user) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if same phone or email already exists for the same user
    const existingCustomer = await ServiceCustomer.findOne({
      user,
      $or: [{ phone }, { email }],
    });

    if (existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number or email already exists for this user.",
        },
        { status: 409, headers: corsHeaders }
      );
    }

    // Create new customer
    const newCustomer = await ServiceCustomer.create({
      fullName,
      phone,
      email,
      description,
      address,
      city,
      state,
      country,
      user,
    });

    // Update user's serviceCustomers list
    await User.findByIdAndUpdate(user, {
      $push: { serviceCustomers: newCustomer._id },
    });

    return NextResponse.json(
      { success: true, data: newCustomer },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    // Handle duplicate key error from DB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        {
          success: false,
          message:
            field === "phone"
              ? "Phone number already exists for this user."
              : field === "email"
              ? "Email already exists for this user."
              : "Duplicate entry.",
        },
        { status: 409, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Unknown error" },
      { status: 500, headers: corsHeaders }
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
