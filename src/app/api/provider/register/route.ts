// src/app/api/provider/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import Provider from "@/models/Provider";
import { z } from "zod";
import { connectToDatabase } from "@/utils/db";
import { signToken } from "@/utils/auth";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phoneNo: z.string().min(10),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const formData = await req.formData();

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phoneNo = formData.get("phoneNo") as string;
  const password = formData.get("password") as string;

  const parsed = schema.safeParse({ fullName, email, phoneNo, password });
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.errors }, { status: 400 });
  }

  const existing = await Provider.findOne({ email });
  if (existing) {
    return NextResponse.json(
      { message: "Email already registered" },
      { status: 409 }
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

  const res = NextResponse.json({ message: "Registered", provider });
  res.cookies.set("token", token, { httpOnly: true, secure: true, path: "/" });

  return res;
}
