import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Checkout from '@/models/Checkout';
import '@/models/Service';
import '@/models/Provider';
import '@/models/ServiceCustomer';
import mongoose from 'mongoose';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Type definitions
interface Service {
  serviceName: string;
  price: number;
  discountedPrice: number;
}

interface ServiceItem {
  serviceName: string;
  price?: number;
  discountedPrice: number;
  total: number;
}


interface Customer {
  name?: string;
  fullName?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  address?: string;
}

interface Provider {
  fullName?: string;
  email?: string;
  phoneNo?: string;
}

interface Invoice {
  _id: mongoose.Types.ObjectId;
  bookingId: string;
  createdAt: Date;
  updatedAt?: Date;
  serviceDate?: Date;
  paymentMethod?: string;
  serviceCustomer: Customer;
  provider: Provider | mongoose.Types.ObjectId;
  service: ServiceItem;
  subTotal?: number;
  discount?: number;
  serviceDiscount?: number,
  serviceDiscountPrice?: number,
  campaignDiscount?: number;
  couponDiscount?: number;
  gst?: number;
  serviceGSTPrice?: number,
  platformFeePrice?: number;
  total?: number;
  totalAmount?: number,
  grandTotal?: number;
  assurityfee?: number;
  listingPrice?: number,
  priceAfterDiscount?: number,
  assurityChargesPrice?: number,
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const id = params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const invoice = await Checkout.findById(id)
      .populate('serviceCustomer')
      .populate({
        path: 'service',
        strictPopulate: false,
      })
      .populate('provider')
      .lean() as unknown as Invoice;

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    console.log(invoice);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { height, width } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let y = height - 50;

    const drawText = (
      text: string | number,
      x: number,
      y: number,
      size = 12,
      color = rgb(0, 0, 0),
      isBold = false
    ) => {
      const textStr = (text?.toString() || '').replace(/₹/g, 'Rs.');
      page.drawText(textStr, {
        x,
        y,
        size,
        font: isBold ? boldFont : font,
        color
      });
    };

    const drawLine = (y: number) => {
      page.drawLine({
        start: { x: 50, y },
        end: { x: width - 50, y },
        thickness: 0.8,
        color: rgb(0.8, 0.8, 0.8),
      });
    };
    const listingPrice = invoice.listingPrice || 0;
    const serviceDiscount = invoice.serviceDiscount || 0;
    const serviceDiscountPrice = invoice.serviceDiscountPrice;
    const gst = invoice.gst || 0;
    const platformFeePrice = invoice.platformFeePrice || 0;
    const assurityFee = invoice.assurityfee || 0;
    const grandTotal =
      invoice.totalAmount || 0;
    // Header
    drawText('INVOICE', 50, y, 18, rgb(0, 0, 0.6), true);
    y -= 25;

    drawText(`Booking #${invoice.bookingId}`, 50, y);
    drawText(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, width - 150, y);
    y -= 30;

    // Company Info (right aligned)
    drawText('3rd Floor, 307 Amanora Chamber,', width - 250, y, 10);
    y -= 12;
    drawText('Amanora Mall, Hadapsar, Pune - 411028', width - 250, y, 10);
    y -= 12;
    drawText('+91 93096 517500', width - 250, y, 10);
    y -= 12;
    drawText('info@bizbooster2x.com', width - 250, y, 10);
    y -= 30;

    // Customer Details Box
    page.drawRectangle({
      x: 50,
      y: y - 140,
      width: width - 90,
      height: 150,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });

    const customer = invoice.serviceCustomer || {};
drawText('Customer Details', 60, y - 20, 14, rgb(0, 0, 0.5), true);
y -= 35;

// First row
drawText(customer.name || customer.fullName || '-', 60, y);
drawText(customer.email || '-', 200, y);
drawText(customer.mobile || customer.phone || '-', 350, y);

// New column: Invoice (INR)
const invoiceAmount = invoice.total || 0;
drawText(`₹${invoiceAmount.toFixed(2)}`, 470, y);

    y -= 20;
    drawLine(y);
    y -= 20;
    // Second row
    drawText('Payment', 60, y, 12, rgb(0, 0, 0), true);
    drawText(invoice.paymentMethod || 'Cash after service', 60, y - 15);
    drawText(`Reference ID: ${invoice.bookingId}`, 60, y - 30);

    drawText('Service Provider', 250, y, 12, rgb(0, 0, 0), true);
    if (invoice.provider && typeof invoice.provider !== 'string' && !(invoice.provider instanceof mongoose.Types.ObjectId)) {
      drawText(invoice.provider.fullName || '-', 250, y - 15);
      drawText(invoice.provider.email || '-', 250, y - 30);
      drawText(invoice.provider.phoneNo || '-', 250, y - 45);

    }

    drawText('Service Time', 400, y, 12, rgb(0, 0, 0), true);

    const dateObj = new Date(invoice.createdAt);

    drawText(`Request Date: ${dateObj.toLocaleDateString('en-IN')}`, 400, y - 15);
    drawText(`Request Time: ${dateObj.toLocaleTimeString('en-IN')}`, 400, y - 30);

    drawText(`Service: ${invoice.serviceDate ? new Date(invoice.serviceDate).toLocaleString('en-IN') : 'N/A'}`, 400, y - 45);

    y -= 100;

    // Booking Summary
    drawText('Booking Summary', 50, y, 14, rgb(0, 0, 0.5), true);
    y -= 20;
    drawLine(y);
    y -= 20;
    // Table Header
    drawText('Service', 50, y, 12, rgb(0, 0, 0), true);
    drawText('Price', 200, y, 12, rgb(0, 0, 0), true);
    drawText('Discount ', 320, y, 12, rgb(0, 0, 0), true);
    drawText('Discounted Price', 440, y, 12, rgb(0, 0, 0), true);
    y -= 15;

    drawLine(y);
    y -= 20;

    // Table Rows
const s = invoice.service;
const serviceName = s?.serviceName || 'N/A';
const price = s?.price || 0;
const discountedPrice = s?.discountedPrice || 0;
const rowServiceDiscountPrice = price - discountedPrice;

drawText(serviceName, 50, y);
drawText(`₹${price.toFixed(2)}`, 200, y);
drawText(`₹${rowServiceDiscountPrice.toFixed(2)}`, 320, y);
drawText(`₹${discountedPrice.toFixed(2)}`, 440, y);
y -= 20;


    y -= 10;
    drawLine(y);
    y -= 20;

    const summaryItems = [
      ['Listing Price', listingPrice],
      [`Service Discount (${invoice.serviceDiscount || '0'}%)`, invoice.serviceDiscountPrice],
      ['Price After Discount', invoice.priceAfterDiscount],
      [`Service GST (${invoice.gst || '0'}%)`, invoice.serviceGSTPrice],
      ['Platform Fee (₹)', platformFeePrice],
      [`Fetch True Assurity Charges (${invoice.assurityfee || '0'}%)`, invoice.assurityChargesPrice],
    ];

    // Draw each line
    summaryItems.forEach(([label, amount]) => {
      drawText(`${label}:`, 50, y);
      drawText(`₹${Number(amount).toFixed(2)}`, 450, y);
      y -= 15;
    });

    // Grand Total
    y -= 10;
    drawText('Grand Total:', 50, y, 14, rgb(0, 0, 0.8), true);
    drawText(`₹${grandTotal.toFixed(2)}`, 450, y, 14, rgb(0, 0, 0.8), true);
    y -= 40;


    drawLine(y);
    y -= 30;
    // Terms & Conditions
    drawText('Terms & Conditions', 50, y, 14, rgb(0, 0, 0.5), true);
    y -= 20;

    const terms = [
      "All service purchases are final and non-refundable once the project has been initiated or delivered. Refunds are",
      "not applicable for change-of-mind requests or delays caused by incomplete information or approvals from the client.",
      "",
      "Customers who opt for the \"Assurity\" option at the time of purchase are eligible for a 100% refund in case of",
      "dissatisfaction, subject to company review and approval. This assurance is designed to provide added confidence",
      "and transparency in our service process.",
      "",
      "Please read the full Terms & Conditions for complete details regarding our refund policy and service commitments."
    ];

    terms.forEach(term => {
      if (term) {
        drawText(term, 50, y, 10);
      }
      y -= 12;
    });

    // Footer
    y -= 20;
    page.drawRectangle({
      x: 50,
      y: y - 20,
      width: width - 100,
      height: 20,
      color: rgb(0.95, 0.95, 0.95),
    });

    drawText('bizbooster.lifelinecart.com', 60, y - 15, 10);
    drawText('+91 93096 517500', width / 2 - 30, y - 15, 10);
    drawText('info@bizbooster2x.com', width - 150, y - 15, 10);

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=invoice-${invoice.bookingId}.pdf`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  } catch (error) {
    console.error('[INVOICE_PDF_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}