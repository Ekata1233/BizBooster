import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Lead from "@/models/Lead";
import imagekit from "@/utils/imagekit";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const statusType = formData.get("statusType") as string;
    const description = formData.get("description") as string;
    const zoomLink = formData.get("zoomLink") as string;
    const paymentLink = formData.get("paymentLink") as string;
    const paymentType = formData.get("paymentType") as "partial" | "full";
    const checkout = formData.get("checkout") as string;
    const document = formData.get("document") as File;

    await connectToDatabase();

    let documentURL = "";
    if (document && document.name) {
      const arrayBuffer = await document.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await imagekit.upload({
        file: buffer,
        fileName: document.name,
      });
      documentURL = result.url;
    }

    const lead = await Lead.create({
      statusType,
      description,
      zoomLink,
      paymentLink,
      paymentType,
      document: documentURL,
      checkout,
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const leads = await Lead.find().populate("checkout").sort({ createdAt: -1 });
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
