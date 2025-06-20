import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import ServiceMan from "@/models/ServiceMan";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  await connectToDatabase();
  const serviceMen = await ServiceMan.find().sort({ createdAt: -1 });
  return NextResponse.json(serviceMen, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const formData = await req.formData();

    const name = (formData.get("name") as string)?.trim() || "";
    const lastName = (formData.get("lastName") as string)?.trim() || "";
    const phoneNo = (formData.get("phoneNo") as string)?.trim() || "";
    const email = (formData.get("email") as string)?.trim() || "";
    const password = (formData.get("password") as string) || "";
    const confirmPassword = (formData.get("confirmPassword") as string) || "";
    const identityType = (formData.get("identityType") as string)?.trim().toLowerCase() || "";
    const identityNumber = (formData.get("identityNumber") as string)?.trim() || "";
    const provider = (formData.get("provider") as string)?.trim() || "";

    // ✅ Field-wise validation
    const errors: { [key: string]: string } = {};

    if (!name) errors.name = "Name is required";
    if (!lastName) errors.lastName = "Last name is required";
    if (!phoneNo) errors.phoneNo = "Phone number is required";
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    if (!confirmPassword) errors.confirmPassword = "Confirm password is required";
    if (!identityType) errors.identityType = "Identity type is required";
    if (!identityNumber) errors.identityNumber = "Identity number is required";
    if (!provider) errors.provider = "Provider is required";

    if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    const allowedTypes = ['passport', 'driving_license', 'addharcard', 'pancard'];
    if (identityType && !allowedTypes.includes(identityType)) {
      errors.identityType = "Invalid identity type";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400, headers: corsHeaders });
    }

    // ✅ Helper to handle file buffers
    const bufferFromFile = async (file: File) => Buffer.from(await file.arrayBuffer());

    // ✅ Upload general image
    let generalImageUrl = "";
    const generalImageFile = formData.get("generalImage") as File;
    if (generalImageFile && generalImageFile.size > 0) {
      const res = await imagekit.upload({
        file: await bufferFromFile(generalImageFile),
        fileName: generalImageFile.name,
      });
      generalImageUrl = res.url;
    }

    // ✅ Upload identity image
    let identityImageUrl = "";
    const identityImageFile = formData.get("identityImage") as File;
    if (identityImageFile && identityImageFile.size > 0) {
      const res = await imagekit.upload({
        file: await bufferFromFile(identityImageFile),
        fileName: identityImageFile.name,
      });
      identityImageUrl = res.url;
    }

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create and save new serviceman
    const newServiceMan = new ServiceMan({
      name,
      lastName,
      phoneNo,
      email,
      password: hashedPassword,
      generalImage: generalImageUrl,
      businessInformation: {
        identityType,
        identityNumber,
        identityImage: identityImageUrl,
      },
      provider
    });

    await newServiceMan.save();

    return NextResponse.json(newServiceMan, { status: 201, headers: corsHeaders });

  } catch (error: any) {
    console.error("Error in POST /serviceman:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error?.message || "Unexpected error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

