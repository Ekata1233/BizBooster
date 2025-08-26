import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import Employee from "@/models/Employee";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ Update Employee
export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    const formData = await req.formData();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing employee ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("update employee : ", formData);

    let updateData: Record<string, unknown> = {};

    // Map basic fields
    [
      "firstName",
      "lastName",
      "phone",
      "role",
      "address",
      "identityType",
      "identityNumber",
      "email",
      "password",
    ].forEach((field) => {
      const value = formData.get(field);
      if (value) updateData[field] = value;
    });

    // Profile Image
    const profileImage = formData.get("profileImage") as File | null;
    if (profileImage && profileImage instanceof File) {
      const buffer = Buffer.from(await profileImage.arrayBuffer());
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${profileImage.name}`,
        folder: "/employees/profile",
      });
      updateData.profileImage = uploadResponse.url;
    }

    // Identity Image
    const identityImage = formData.get("identityImage") as File | null;
    if (identityImage && identityImage instanceof File) {
      const buffer = Buffer.from(await identityImage.arrayBuffer());
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${identityImage.name}`,
        folder: "/employees/identity",
      });
      updateData.identityImage = uploadResponse.url;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return NextResponse.json(
      { success: true, data: updatedEmployee },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 400, headers: corsHeaders }
    );
  }
}

// ✅ Delete Employee
export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing employee ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Employee permanently deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
