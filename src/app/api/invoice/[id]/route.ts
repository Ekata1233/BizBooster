import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Checkout from '@/models/Checkout';
import '@/models/Service';
import '@/models/Provider';
import '@/models/ServiceCustomer';
import mongoose from 'mongoose';
import { PDFDocument, rgb } from 'pdf-lib';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Invoice ID' },
        { status: 400, headers: corsHeaders }
      );
    }

    const invoice = await Checkout.findById(id).populate('service provider serviceCustomer');

    if (!invoice) {
      return NextResponse.json(
        { message: 'Invoice not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size in points

    // Embed the standard Helvetica font
    const helveticaFont = await pdfDoc.embedFont('Helvetica');

    // Helper function to format currency without ₹ symbol
    const formatCurrency = (amount: number) => {
      return `Rs. ${amount?.toFixed(2) || '0.00'}`;
    };

    // Draw invoice header
    page.drawText('Invoice', {
      x: 50,
      y: 800,
      size: 24,
      font: helveticaFont,
      color: rgb(0, 0.31, 0.62), // #00509D
    });

    // Draw booking information
    page.drawText(`Booking #${invoice.bookingId || invoice._id}`, {
      x: 50,
      y: 770,
      size: 12,
      font: helveticaFont,
    });

    page.drawText(`Date: ${new Date(invoice.createdAt).toLocaleString('en-IN')}`, {
      x: 50,
      y: 750,
      size: 12,
      font: helveticaFont,
    });

    // Draw company information
    page.drawText('3rd Floor, 307 Amanora Chamber, Amanora Mall, Hadapsar, Pune – 411028', {
      x: 300,
      y: 800,
      size: 10,
      font: helveticaFont,
    });

    // Draw customer information
    page.drawText('Customer Details:', {
      x: 50,
      y: 700,
      size: 14,
      font: helveticaFont,
    });

    page.drawText(invoice.serviceCustomer?.fullName || '-', {
      x: 50,
      y: 680,
      size: 12,
      font: helveticaFont,
    });

    // Add a simple table for services
    const service = invoice.service;
    const startY = 600;
    
    // Table headers
    page.drawText('Service', { x: 50, y: startY, size: 12, font: helveticaFont });
    page.drawText('Price', { x: 250, y: startY, size: 12, font: helveticaFont });
    page.drawText('Total', { x: 400, y: startY, size: 12, font: helveticaFont });

    // Table row - Using Rs. instead of ₹
    page.drawText(service?.serviceName || 'N/A', { x: 50, y: startY - 30, size: 12, font: helveticaFont });
    page.drawText(formatCurrency(service?.price), { x: 250, y: startY - 30, size: 12, font: helveticaFont });
    page.drawText(formatCurrency(invoice.totalAmount), { x: 400, y: startY - 30, size: 12, font: helveticaFont });

    // Add totals
    const totalsStartY = startY - 100;
    page.drawText(`Subtotal: ${formatCurrency(service?.price)}`, { x: 400, y: totalsStartY, size: 12, font: helveticaFont });
    page.drawText(`Discount: ${formatCurrency((service?.price || 0) - (service?.discountedPrice || 0))}`, { 
      x: 400, 
      y: totalsStartY - 20, 
      size: 12, 
      font: helveticaFont 
    });
    page.drawText(`Total: ${formatCurrency(invoice.totalAmount)}`, { 
      x: 400, 
      y: totalsStartY - 40, 
      size: 14, 
      font: helveticaFont, 
      color: rgb(0, 0.31, 0.62) 
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=invoice-${invoice._id}.pdf`,
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('[INVOICE_GENERATION_ERROR]', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}