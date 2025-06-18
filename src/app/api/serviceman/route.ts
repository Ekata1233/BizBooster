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

  // Input validations
  if (!name || !lastName || !phoneNo || !email || !password || !confirmPassword || !identityType || !identityNumber|| provider) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400, headers: corsHeaders });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ message: "Passwords do not match" }, { status: 400, headers: corsHeaders });
  }

  const allowedTypes = ['passport', 'driving_license', 'nid', 'trade_license'];
  if (!allowedTypes.includes(identityType)) {
    return NextResponse.json({ message: "Invalid identity type" }, { status: 400, headers: corsHeaders });
  }

  const bufferFromFile = async (file: File) => Buffer.from(await file.arrayBuffer());

  let generalImageUrl = "";
  const generalImageFile = formData.get("generalImage") as File;
  if (generalImageFile && generalImageFile.size > 0) {
    const res = await imagekit.upload({
      file: await bufferFromFile(generalImageFile),
      fileName: generalImageFile.name,
    });
    generalImageUrl = res.url;
  }

  let identityImageUrl = "";
  const identityImageFile = formData.get("identityImage") as File;
  if (identityImageFile && identityImageFile.size > 0) {
    const res = await imagekit.upload({
      file: await bufferFromFile(identityImageFile),
      fileName: identityImageFile.name,
    });
    identityImageUrl = res.url;
  }

  // Password hashing
  const hashedPassword = await bcrypt.hash(password, 10);

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
}
