import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import User from "@/models/User";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

export async function PATCH(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID not found..." },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const {
      gender,
      maritalStatus,
      bloodGroup,
      dateOfBirth,
      education,
      profession,
      emergencyContact,
    } = body;

    // ✅ Validate dateOfBirth before updating
    if (dateOfBirth && isNaN(new Date(dateOfBirth).getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid date format for DOB" },
        { status: 400, headers: corsHeaders }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        ...(gender && { gender }),
        ...(maritalStatus && { maritalStatus }),
        ...(bloodGroup && { bloodGroup }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(education && { education }),
        ...(profession && { profession }),
        ...(emergencyContact && { emergencyContact }),
        additionalDetailsCompleted: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedUser },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    let message = "Something went wrong";
    if (error instanceof Error) {
      // ✅ Cleaner error handling for invalid date or cast errors
      if (error.message.includes("Cast to date failed")) {
        message = "Invalid date format for DOB";
      } else {
        message = error.message;
      }
    }

    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
