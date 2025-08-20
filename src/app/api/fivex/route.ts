import { NextResponse } from "next/server";
import FiveXGuarantee from "@/models/FiveXGuarantee";
import { connectToDatabase } from "@/utils/db";

// POST (create)
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const { leadcount, fixearning, months } = body; // ✅ Accept months too
    if (!leadcount || !fixearning || !months) {
      return NextResponse.json(
        { message: "All fields (leadcount, fixearning, months) are required ❌" },
        { status: 400 }
      );
    }

    const newEntry = await FiveXGuarantee.create({ leadcount, fixearning, months });

    return NextResponse.json(
      {
        message: "Saved successfully ✅",
        data: newEntry,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error saving data", error: error.message },
      { status: 500 }
    );
  }
}

// GET (fetch all)
export async function GET() {
  try {
    await connectToDatabase();
    const entries = await FiveXGuarantee.find({});
    return NextResponse.json(entries, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error fetching data", error: error.message },
      { status: 500 }
    );
  }
}
