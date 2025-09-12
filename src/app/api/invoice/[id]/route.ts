import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Checkout from '@/models/Checkout';
import Lead from '@/models/Lead';
import '@/models/Service';
import '@/models/Provider';
import '@/models/ServiceCustomer';
import mongoose from 'mongoose';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Type definitions (unchanged)
interface ServiceItem {
  serviceName: string;
  price?: number;
  discountedPrice: number;
  total?: number;
}

interface ExtraService {
serviceName: string;
  price: number;
  discount: number;
  total: number;
  commission: string;
  isLeadApproved: boolean;

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
interface LeadType {
  checkout: string;
  extraService?: ExtraService[];
  // add other fields if needed
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
  service: ServiceItem | ServiceItem[];
  subTotal?: number;
  discount?: number;
  serviceDiscount?: number;
  serviceDiscountPrice?: number;
  campaignDiscount?: number;

  couponDiscount?: number;
  couponDiscountPrice?: number; 
  gst?: number;
  serviceGSTPrice?: number;
  platformFeePrice?: number;
  total?: number;
  totalAmount?: number;
  grandTotal?: number;
  assurityfee?: number;
  listingPrice?: number;
  priceAfterDiscount?: number;
  assurityChargesPrice?: number;
  discountAmountType?: 'Percentage' | 'Rupees';
  coupon?: { couponCode?: string };
  extraService?: any[];
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID format." },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Fetch Invoice
    const invoice = await Checkout.findById(id)
      .populate('serviceCustomer')
      .populate({ path: 'service', strictPopulate: false })
      .populate('provider')
      .lean() as unknown as Invoice;

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404, headers: corsHeaders });
    }

    // ✅ Fetch related Lead to get extra services
    const lead = await Lead.findOne({ checkout: id }).lean<LeadType>();

const extraServices: ExtraService[] = lead?.extraService || [];
console.log("extra services", extraServices);

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // first page
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let y = height - 50;
    const margin = 50;
    const bottomMargin = 50;

    // Function to check if we need a new page
    const checkPageSpace = (requiredSpace: number): boolean => {
      return y - requiredSpace > bottomMargin;
    };

    // Function to add a new page
    const addNewPage = () => {
      page = pdfDoc.addPage([595, 842]);
      y = height - 50;
    };

    // Function to draw text with pagination
    const drawText = (text: string | number, x: number, yPos: number, size = 12, color = rgb(0, 0, 0), isBold = false) => {
      const textStr = (text?.toString() || '').replace(/₹/g, 'Rs.');
      page.drawText(textStr, { x, y: yPos, size, font: isBold ? boldFont : font, color });
    };

    // Function to draw line with pagination
    const drawLine = (yPos: number) => {
      page.drawLine({
        start: { x: margin, y: yPos },
        end: { x: width - margin, y: yPos },
        thickness: 0.8,
        color: rgb(0.8, 0.8, 0.8)
      });
    };
// Draw text with wrapping at a fixed width
const drawWrappedText = (
  text: string,
  x: number,
  yPos: number,
  maxWidth: number,
  size = 12,
  isBold = false
) => {
  const fontToUse = isBold ? boldFont : font;
  const words = text.split(' ');
  let line = '';
  let currentY = yPos;

  for (const word of words) {
    const testLine = line + word + ' ';
    const textWidth = fontToUse.widthOfTextAtSize(testLine, size);
    if (textWidth > maxWidth) {
      page.drawText(line, { x, y: currentY, size, font: fontToUse });
      currentY -= size + 2; // move to next line
      line = word + ' ';
    } else {
      line = testLine;
    }
  }

  if (line) {
    page.drawText(line, { x, y: currentY, size, font: fontToUse });
    currentY -= size + 2;
  }

  return currentY; // return new Y position after text
};

    // Function to move to next line with pagination
    const nextLine = (space = 20) => {
      y -= space;
      if (y < bottomMargin + 100) {
        addNewPage();
      }
    };


    const listingPrice = invoice.listingPrice || 0;
    const serviceDiscount = invoice.serviceDiscount || 0;
    const serviceDiscountPrice = invoice.serviceDiscountPrice;
    const gst = invoice.gst || 0;
    const assurityFee = invoice.assurityfee || 0;
    const platformFeePrice = invoice.platformFeePrice || 0;

    const calculatedServices = extraServices.map(service => {
      const gstAmount = ((service.total || 0) * gst) / 100;
      const assurityAmount = ((service.total || 0) * assurityFee) / 100;
      const finalAmount = (service.total || 0) + gstAmount + assurityAmount;

      return {
        ...service,
        gstAmount,
        assurityAmount,
        finalAmount,
      };
    });

    // ✅ Sum all final amounts
    const extraServicesTotal1 = calculatedServices.reduce(
      (sum, service) => sum + service.finalAmount,
      0
    );

    // ✅ Add to invoice total
    const grandTotal = (invoice.totalAmount || 0) + extraServicesTotal1;

    // 🔹 Header
    drawText('INVOICE', margin, y, 18, rgb(0, 0, 0.6), true);
    nextLine(25);
    drawText(`Booking #${invoice.bookingId}`, margin, y);
    drawText(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, width - 150, y);
    nextLine(30);

    // Company Info
    drawText('3rd Floor, 307 Amanora Chamber,', width - 250, y, 10);
    nextLine(12);
    drawText('Amanora Mall, Hadapsar, Pune - 411028', width - 250, y, 10);
    nextLine(12);
    drawText('+91 93096 517500', width - 250, y, 10);
    nextLine(12);
    drawText('info@bizbooster2x.com', width - 250, y, 10);
    nextLine(30);

    // Customer Box
    if (!checkPageSpace(150)) addNewPage();
    page.drawRectangle({
      x: margin,
      y: y - 140,
      width: width - 90,
      height: 150,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1
    });

    const customer = invoice.serviceCustomer || {};
    drawText('Customer Details', margin + 10, y - 10, 14, rgb(0, 0, 0.5), true);
    nextLine(35);

    drawText('Name', margin + 10, y, 10, rgb(0, 0, 0), true);
    drawText('Email', 200, y, 10, rgb(0, 0, 0), true);
    drawText('Phone', 350, y, 10, rgb(0, 0, 0), true);
    drawText('Invoice (INR)', 470, y, 10, rgb(0, 0, 0), true);
    nextLine(15);

    drawText(customer.name || customer.fullName || '-', margin + 10, y);
    drawText(customer.email || '-', 200, y);
    drawText(customer.mobile || customer.phone || '-', 350, y);
    drawText(`₹${grandTotal.toFixed(2)}`, 470, y, 14, rgb(0, 0.31, 0.615), true);
    nextLine(20);
    drawLine(y);
    nextLine(20);

    // Payment & Provider Details
    drawText('Payment', margin + 10, y, 12, rgb(0, 0, 0), true);
    drawText(invoice.paymentMethod || 'Cash after service', margin + 10, y - 15);
    drawText(`Reference ID: ${invoice.bookingId}`, margin + 10, y - 30);

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
    if (y < bottomMargin + 100) addNewPage();

    // Booking Summary
    drawText('Booking Summary', margin, y, 14, rgb(0, 0, 0.5), true);
    nextLine(20);
    drawLine(y);
    nextLine(20);

    drawText('Service', margin, y, 12, rgb(0, 0, 0), true);
    drawText('Price', 200, y, 12, rgb(0, 0, 0), true);
    drawText('Discount', 320, y, 12, rgb(0, 0, 0), true);
    drawText('Discounted Price', 440, y, 12, rgb(0, 0, 0), true);
    nextLine(15);
    drawLine(y);
    nextLine(20);

    // Main services
    const services = Array.isArray(invoice.service) ? invoice.service : [invoice.service];
  for (const s of services) {
  if (!checkPageSpace(0)) addNewPage();

  const serviceName = s?.serviceName || 'N/A';
  const price = s?.price || 0;
  const discountedPrice = s?.discountedPrice || 0;
  const rowServiceDiscountPrice = price - discountedPrice;

  const originalY = y; // store original y before wrapping
  const newY = drawWrappedText(serviceName, margin, y, 150); // wrap at 150px

  // Vertically center other columns with wrapped text
  const lineHeight = 14; // font size + spacing
  const wrappedHeight = originalY - newY; // total height of wrapped text
  const centerY = originalY - wrappedHeight / 2 - lineHeight / 2;

  drawText(`₹${price.toFixed(2)}`, 200, centerY);
  drawText(`₹${rowServiceDiscountPrice.toFixed(2)}`, 320, centerY);
  drawText(`₹${discountedPrice.toFixed(2)}`, 440, centerY);

  y = newY - 6; // add a little extra spacing after block
}


    // Extra services


    if (!checkPageSpace(30)) addNewPage();
    nextLine(10);
    drawLine(y);
    nextLine(20);

    // Summary Items
    const summaryItems = [
      ['Listing Price', invoice.listingPrice],
      [
        `Service Discount (${invoice.discountAmountType === 'Percentage' ? `${invoice.serviceDiscount || 0}%` : `Rs.${invoice.serviceDiscount || 0}`})`,
        invoice.serviceDiscountPrice,
      ],
      ['Price After Discount', invoice.priceAfterDiscount],
      [
        invoice.discountAmountType === 'Percentage'
          ? `Coupon Discount (${invoice.couponDiscount || 0}% - ${invoice.coupon?.couponCode || '-'})`
          : `Coupon Discount (Rs.${invoice.couponDiscount || 0} - ${invoice.coupon?.couponCode || '-'})`,
        invoice.couponDiscountPrice,
      ],
      [`Service GST (${invoice.gst || 0}%)`, invoice.serviceGSTPrice],
      ['Platform Fee (₹)', invoice.platformFeePrice],
      [`Fetch True Assurity Charges (${invoice.assurityfee || 0}%)`, invoice.assurityChargesPrice],
      ['Service Total', invoice.totalAmount],

    ];


    // Example GST and Assurity values (can come from invoice or service)
    const gstPercent = gst;       // GST %
    const assurityPercent = assurityFee;   // Assurity %
    let extraServicesTotal = 0;
    const extraservice = extraServices.flatMap(service => {
      const gstAmount = ((service.total || 0) * gstPercent) / 100;
      const assurityAmount = ((service.total || 0) * assurityPercent) / 100;
      const finalAmount = (service.total || 0) + gstAmount + assurityAmount;
      extraServicesTotal += finalAmount;
      return [
        ['Listing Price', service.price || 0],
        [
          `Service Discount (${typeof service.discount === 'number' ? service.discount + '%' : `Rs.${service.discount || 0}`})`,
          service.discount || 0,
        ],
        ['Price After Discount', service.total || 0],
        [`GST (${gstPercent}%)`, gstAmount],
        [`Assurity Charges (${assurityPercent}%)`, assurityAmount],
        ['Final Amount', finalAmount],
      ];
    });





    for (const [label, amount] of summaryItems) {
      if (!checkPageSpace(15)) addNewPage();
      drawText(`${label}:`, margin, y);
      drawText(`₹${Number(amount || 0).toFixed(2)}`, 450, y);
      nextLine(15);
    }
    addNewPage();
    if (extraServices.length > 0) {
      if (!checkPageSpace(30)) addNewPage();
      nextLine(10);
      drawLine(y);
      nextLine(20);

      drawText('Extra Services', margin, y, 12, rgb(0, 0, 0), true);
      nextLine(20);
    drawLine(y);
    nextLine(20);

      for (const [index, extra] of extraServices.entries()) {
        if (!checkPageSpace(20)) addNewPage();

        drawText(`${index + 1}. ${extra.serviceName}`, margin, y);
        drawText(`₹${extra.price.toFixed(2)}`, 200, y);
        drawText(
          extra.discount > 0 ? (invoice.discountAmountType === 'Percentage' ? `${extra.discount}%` : `Rs.${extra.discount}`) : '0',
          320,
          y
        );
        drawText(`₹${extra.total.toFixed(2)}`, 440, y);
       nextLine(20);
    drawLine(y);
    nextLine(20);
      }
    }

    for (const [label, amount] of extraservice) {
      if (!checkPageSpace(15)) addNewPage();
      drawText(`${label}:`, margin, y);
      drawText(`₹${Number(amount || 0).toFixed(2)}`, 450, y);
      nextLine(15);
    }

    if (!checkPageSpace(40)) addNewPage();
    nextLine(10);
    drawText('Grand Total:', margin, y, 14, rgb(0, 0, 0.8), true);
    drawText(`₹${grandTotal.toFixed(2)}`, 450, y, 14, rgb(0, 0, 0.8), true);
    nextLine(40);
    drawLine(y);
    nextLine(30);

    // Terms
    if (!checkPageSpace(60)) addNewPage();
    drawText('Terms & Conditions', margin, y, 14, rgb(0, 0, 0.5), true);
    nextLine(20);

    const terms = [
      "All service purchases are final and non-refundable once the project has been initiated or delivered.",
      "Customers who opt for the \"Assurity\" option are eligible for a 100% refund in case of dissatisfaction, subject to review.",
    ];

    for (const term of terms) {
      if (!checkPageSpace(12)) addNewPage();
      drawText(term, margin, y, 10);
      nextLine(12);
    }

    // Footer
    if (!checkPageSpace(40)) addNewPage();
    nextLine(20);

    page.drawRectangle({
      x: margin,
      y: y - 20,
      width: width - 100,
      height: 20,
      color: rgb(0.95, 0.95, 0.95)
    });

    drawText('fetchtrue.com', margin + 10, y - 15, 10);
    drawText('+91 93096 517500', width / 2 - 30, y - 15, 10);
    drawText('info@fetchtrue.com', width - 150, y - 15, 10);

   const pdfBytes = await pdfDoc.save();

// ✅ Convert Uint8Array → Buffer
const pdfBuffer = Buffer.from(pdfBytes);

return new NextResponse(pdfBuffer, {
  status: 200,
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename=invoice-${invoice.bookingId}.pdf`,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  },
});

  } catch (error) {
    console.error('[INVOICE_PDF_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}