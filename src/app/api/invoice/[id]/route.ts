// /app/api/invoice/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDownloadLink, renderToStream } from "@react-pdf/renderer";
import { connectToDatabase } from "@/utils/db";
import Checkout from "@/models/Checkout";
import User from "@/models/User";
import Provider from "@/models/Provider";
import Service from "@/models/Service";
import ServiceCustomer from "@/models/ServiceCustomer";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  try {
    const checkout = await Checkout.findById(params.id)
      .populate("user")
      .populate("provider")
      .populate("service")
      .populate("serviceCustomer")
      .lean();

    if (!checkout) {
      return NextResponse.json({ error: "Checkout not found" }, { status: 404 });
    }

    // const pdfStream = await renderToStream(<InvoicePDF data={checkout} />);

    // return new NextResponse(pdfStream as any, {
    //   status: 200,
    //   headers: {
    //     "Content-Type": "application/pdf",
    //     "Content-Disposition": `inline; filename=invoice-${checkout.bookingId}.pdf`,
    //   },
    // });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
