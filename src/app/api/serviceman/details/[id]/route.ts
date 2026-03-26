import { NextResponse } from "next/server";
import ServiceMan from "@/models/ServiceMan";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// OPTIONS (CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

//
// ✅ GET ServiceMan by ID
//
export async function GET(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const serviceman = await ServiceMan.findById(id);

    if (!serviceman) {
      return NextResponse.json(
        { success: false, message: "ServiceMan not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: serviceman },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching ServiceMan" },
      { status: 500, headers: corsHeaders }
    );
  }
}

//
// ✅ PATCH (Update ServiceMan)
//
export async function PATCH(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const formData = await req.formData();

    const serviceman = await ServiceMan.findById(id);

    if (!serviceman) {
      return NextResponse.json(
        { success: false, message: "ServiceMan not found" },
        { status: 404 }
      );
    }

    //
    // ✅ TEXT FIELDS (partial update)
    //
    const name = formData.get("name") as string;
    const lastName = formData.get("lastName") as string;
    const phoneNo = formData.get("phoneNo") as string;
    const email = formData.get("email") as string;

    const identityType = formData.get("identityType") as string;
    const identityNumber = formData.get("identityNumber") as string;

    if (name) serviceman.name = name;
    if (lastName) serviceman.lastName = lastName;
    if (phoneNo) serviceman.phoneNo = phoneNo;
    if (email) serviceman.email = email;

    if (identityType)
      serviceman.businessInformation.identityType = identityType;

    if (identityNumber)
      serviceman.businessInformation.identityNumber = identityNumber;

    //
    // ✅ FILE UPLOAD: generalImage
    //
    const generalImageFile = formData.get("generalImage") as File;

    if (generalImageFile && generalImageFile.size > 0) {
      const bytes = await generalImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadRes = await imagekit.upload({
        file: buffer,
        fileName: `serviceman_${Date.now()}`,
      });

      serviceman.generalImage = uploadRes.url;
    }

    //
    // ✅ FILE UPLOAD: identityImage
    //
    const identityImageFile = formData.get("identityImage") as File;

    if (identityImageFile && identityImageFile.size > 0) {
      const bytes = await identityImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadRes = await imagekit.upload({
        file: buffer,
        fileName: `identity_${Date.now()}`,
      });

      serviceman.businessInformation.identityImage = uploadRes.url;
    }

    //
    // ✅ SAVE (only changed fields will update)
    //
    await serviceman.save();

    return NextResponse.json({
      success: true,
      message: "ServiceMan updated successfully",
      data: serviceman,
    });

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Duplicate field value (email / phone)",
        },
        { status: 400 }
      );
    }

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error updating ServiceMan",
      },
      { status: 500 }
    );
  }
}