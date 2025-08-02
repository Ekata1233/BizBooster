// lib/pdf/generateInvoicePdf.tsx
'use server';

import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import InvoicePDF from '@/components/pdf/InvoicePDF';

export async function generateInvoicePdf(data: any) {
  return await renderToStream(<InvoicePDF data={data} />);
}
