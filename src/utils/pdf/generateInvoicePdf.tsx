// utils/pdf/generateInvoicePdf.ts
import { createInvoiceDocument } from "@/components/pdf/InvoicePDF";
import { renderToStream } from "@react-pdf/renderer";

export async function generateInvoicePdf(data: any) {
  const document = createInvoiceDocument(data); // ✅ Safe, pure <Document />
  return await renderToStream(document);        // ✅ Now works perfectly
}
