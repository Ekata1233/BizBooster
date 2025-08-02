import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { connectToDatabase } from '@/utils/db';
import Checkout from '@/models/Checkout';
import '@/models/Service';
import '@/models/Provider';
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  const invoiceId = params.id;
  const invoice = await Checkout.findById(invoiceId).populate('service provider');

  if (!invoice) {
    return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            font-size: 13px;
            line-height: 1.4;
            color: #000;
          }
          .header, .footer {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .footer {
            background-color: #f0f0f0;
            padding: 10px;
            font-size: 13px;
          }
          .info-block {
            border: 1px solid #ccc;
            padding: 16px;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f9f9f9;
          }
          h2 {
            color: #00509D;
            margin-bottom: 5px;
          }
          .total-row {
            font-weight: bold;
            color: #00509D;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2>Invoice</h2>
            <p>Booking #${invoice.bookingId || invoice._id}</p>
            <p>Date: ${new Date(invoice.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <div style="text-align: right;">
            <p>3rd Floor, 307 Amanora Chamber, Amanora Mall, Hadapsar, Pune – 411028</p>
            <p>+91 93096 517500</p>
            <p>info@bizbooster2x.com</p>
          </div>
        </div>

        <div class="info-block">
          <div style="display: flex; justify-content: space-between;">
            <div style="width: 30%;">
              <strong>Customer Details</strong>
              <p>${invoice.customerName || '-'}</p>
            </div>
            <div style="width: 20%;">
              <strong>Email</strong>
              <p>${invoice.customerEmail || '-'}</p>
            </div>
            <div style="width: 25%;">
              <strong>Phone</strong>
              <p>${invoice.customerPhone || '-'}</p>
            </div>
            <div style="width: 25%;">
              <strong>Invoice Total</strong>
              <p style="font-weight: bold; font-size: 18px; color: #007bff;">₹${invoice.amount?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="margin-bottom: 10px;">Booking Summary</h3>
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Price</th>
                <th>Discount Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${invoice.service?.serviceName || 'N/A'}</td>
                <td>₹${invoice.service?.price?.toFixed(2) || '0.00'}</td>
                <td>₹${invoice.service?.discountedPrice?.toFixed(2) || '0.00'}</td>
                <td>₹${invoice.totalAmount?.toFixed(2) || '0.00'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top: 20px;">
          ${[
            ['Subtotal', invoice.service?.price ?? 0],
            ['Discount', (invoice.service?.price ?? 0) - (invoice.service?.discountedPrice ?? 0)],
            ['Coupon Discount', invoice.couponDiscount || 0],
            ['VAT', 0],
            ['Platform Fee', invoice.platformFee || 0],
            ['Total', invoice.totalAmount || 0],
          ]
            .map(
              ([label, value]) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span><strong>${label}:</strong></span>
              <span>₹${Number(value).toFixed(2)}</span>
            </div>
          `
            )
            .join('')}
          <div class="total-row" style="display: flex; justify-content: space-between; margin-top: 10px;">
            <span>Grand Total</span>
            <span>₹${(invoice.totalAmount || 0).toFixed(2)}</span>
          </div>
        </div>

        <div style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px;">
          <p><strong>Terms & Conditions</strong></p>
          <p>All service purchases are final and non-refundable once the project has been initiated or delivered.</p>
          <p>Customers who opt for the "Assurity" option are eligible for a 100% refund subject to review.</p>
          <p>Please read the full Terms & Conditions for complete refund policy.</p>
        </div>

        <div class="footer">
          <span>bizbooster.lifelinecart.com</span>
          <span>+91 93096 517500</span>
          <span>info@bizbooster2x.com</span>
        </div>
      </body>
    </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=invoice-${invoice._id}.pdf`,
    },
  });
}
