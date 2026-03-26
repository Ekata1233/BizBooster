import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/utils/db";
import ServiceMan from "@/models/ServiceMan";
import { generateToken } from "@/utils/jwt";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { identifier, password } = body;

    // ✅ Validation
    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: "Email/Phone and password are required" },
        { status: 400 }
      );
    }

    // ✅ Find user by email OR phone
    const user = await ServiceMan.findOne({
      $or: [
        { phoneNo: identifier },
        { email: identifier }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Compare Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Generate Token
    const token = generateToken({
      id: user._id,
      phoneNo: user.phoneNo,
      email: user.email,
    });

    // ✅ Safe user response
    const userData = {
      id: user._id,
      name: user.name,
      lastName: user.lastName,
      phoneNo: user.phoneNo,
      email: user.email,
      serviceManId: user.serviceManId,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token,
        user: userData,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}