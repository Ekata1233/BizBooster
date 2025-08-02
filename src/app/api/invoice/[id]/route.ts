// /app/api/invoice/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDownloadLink, renderToStream } from "@react-pdf/renderer";
import { connectToDatabase } from "@/utils/db";
import Checkout from "@/models/Checkout";
import "@/models/User";
import "@/models/Provider";
import "@/models/Service";
import "@/models/ServiceCustomer";
import { generateInvoicePdf } from "@/utils/pdf/generateInvoicePdf";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    const checkout = await Checkout.findById(id)
      .populate("user")
      .populate("provider")
      .populate("service")
      .populate("serviceCustomer")
      .lean();


    if (!checkout) {
      return NextResponse.json({ error: "Checkout not found" }, { status: 404 });
    }

    const pdfStream = await generateInvoicePdf(checkout);

    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];

    return new NextResponse(pdfStream as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=invoice-${formattedDate}.pdf`,
      },
    });

  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
