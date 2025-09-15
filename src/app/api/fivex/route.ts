import { NextResponse } from "next/server";
import FiveXGuarantee from "@/models/FiveXGuarantee";
import { connectToDatabase } from "@/utils/db";

// POST (create or update single entry)
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    console.log("body : ", body)

    const { leadcount, fixearning, months } = body; // ✅ Accept months too
    if (!leadcount || !fixearning || !months) {
      return NextResponse.json(
        { message: "All fields (leadcount, fixearning, months) are required ❌" },
        { status: 400 }
      );
    }

    // ✅ Always keep only one record → update if exists, else create
    const updatedEntry = await FiveXGuarantee.findOneAndUpdate(
      {}, // match first (or only) document
      { leadcount, fixearning, months },
      { new: true, upsert: true } // update if exists, insert if not
    );

    return NextResponse.json(
      {
        message: "Saved/Updated successfully ✅",
        data: updatedEntry,
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

// GET (fetch all → but only one will exist)
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
