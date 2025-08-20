import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import Employee from "@/models/Employee";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle Preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ✅ Create Employee
export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    console.log("formdata of the employee : ", formData)

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as string;
    const address = formData.get("address") as string;
    const identityType = formData.get("identityType") as string;
    const identityNumber = formData.get("identityNumber") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!firstName || !lastName || !phone || !role || !address || !identityType || !identityNumber || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Upload Profile Image
    let profileImageUrl = "";
    const profileImage = formData.get("profileImage") as File;
    if (profileImage) {
      const buffer = Buffer.from(await profileImage.arrayBuffer());
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${profileImage.name}`,
        folder: "/employees/profile",
      });
      profileImageUrl = uploadResponse.url;
    }

    // Upload Identity Image
    let identityImageUrl = "";
    const identityImage = formData.get("identityImage") as File;
    if (identityImage) {
      const buffer = Buffer.from(await identityImage.arrayBuffer());
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${identityImage.name}`,
        folder: "/employees/identity",
      });
      identityImageUrl = uploadResponse.url;
    }

    const newEmployee = await Employee.create({
      firstName,
      lastName,
      phone,
      role,
      address,
      profileImage: profileImageUrl,
      identityType,
      identityNumber,
      identityImage: identityImageUrl,
      email,
      password, // ⚠️ Should hash before save (bcrypt)
    });

    return NextResponse.json(
      { success: true, data: newEmployee },
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

// ✅ Get All Employees (with search)
export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  const filter: {
    $or?: { [key: string]: { $regex: string; $options: string } }[];
  } = {};

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    filter.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { phone: searchRegex },
      { email: searchRegex },
    ];
  }

  try {
    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(
      { success: true, data: employees },
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
