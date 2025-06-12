// src/app/api/provider/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import Provider from "@/models/Provider";
import { z } from "zod";
import { connectToDatabase } from "@/utils/db";
import { signToken } from "@/utils/auth";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ✅ Handle preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phoneNo: z.string().min(10),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phoneNo = formData.get("phoneNo") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const parsed = schema.safeParse({ fullName, email, phoneNo, password });
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.errors },
        { status: 400, headers: corsHeaders }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400, headers: corsHeaders }
      );
    }

    const existing = await Provider.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409, headers: corsHeaders }
      );
    }

    const provider = await Provider.create({
      fullName,
      email,
      phoneNo,
      password,
      step1Completed: true,
      registrationStatus: "basic",
    });

    const token = signToken(provider._id.toString());

    const res = NextResponse.json({ message: "Registered", provider },{ headers: corsHeaders });
    res.cookies.set("token", token, { httpOnly: true, secure: true, path: "/" });

    return res;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again later." },
      { status: 500, headers: corsHeaders }
    );
  }
}

