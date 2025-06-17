import { NextRequest, NextResponse } from "next/server";
import ServiceMan from "@/models/ServiceMan";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
export async function POST(req: NextRequest) {
  await connectToDatabase();
  const formData = await req.formData();

  const name = formData.get("name") as string;
  const lastName = formData.get("lastName") as string;
  const phoneNo = formData.get("phoneNo") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const identityType = formData.get("identityType") as string;
  const identityNumber = formData.get("identityNumber") as string;

  const generalImageFile = formData.get("generalImage") as File;
  const identityImageFile = formData.get("identityImage") as File;

  if (password !== confirmPassword) {
    return NextResponse.json({ message: "Passwords do not match" }, { status: 400 ,headers: corsHeaders });
  }

  const bufferFromFile = async (file: File) => Buffer.from(await file.arrayBuffer());

  let generalImageUrl = "";
  if (generalImageFile && generalImageFile.size > 0) {
    const res = await imagekit.upload({
      file: await bufferFromFile(generalImageFile),
      fileName: generalImageFile.name,
    });
    generalImageUrl = res.url;
  }

  let identityImageUrl = "";
  if (identityImageFile && identityImageFile.size > 0) {
    const res = await imagekit.upload({
      file: await bufferFromFile(identityImageFile),
      fileName: identityImageFile.name,
    });
    identityImageUrl = res.url;
  }

  const newServiceMan = new ServiceMan({
    name,
    lastName,
    phoneNo,
    generalImage: generalImageUrl,
    email,
    password,
    businessInformation: {
      identityType,
      identityNumber,
      identityImage: identityImageUrl,
    },
  });

  await newServiceMan.save();
  return NextResponse.json(newServiceMan, { status: 201 , headers: corsHeaders });
}

export async function GET() {
  await connectToDatabase();
  const serviceMen = await ServiceMan.find().sort({ createdAt: -1,  });
  return NextResponse.json(serviceMen);
}
