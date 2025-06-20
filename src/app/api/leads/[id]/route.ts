import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import Lead from "@/models/Lead";
import imagekit from "@/utils/imagekit";

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // Extract ID from URL path

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

    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      {
        statusType,
        description,
        zoomLink,
        paymentLink,
        paymentType,
        ...(documentURL && { document: documentURL }),
        checkout,
      },
      { new: true }
    );

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // Extract ID from URL path

    await connectToDatabase();
    await Lead.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
