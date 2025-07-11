import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import HelpAndSupport from '@/models/HelpandSupport';
import mongoose from 'mongoose';
import { transporter } from '@/utils/nodemailer';
// import User from '@/models/User';





export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { supportId, answer } = body;

    // Validate input
    if (!supportId || !answer) {
      return NextResponse.json(
        { success: false, message: 'Missing supportId or answer.' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(supportId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid support entry ID.' },
        { status: 400 }
      );
    }

    // Fetch the support entry
    const supportEntry = await HelpAndSupport.findById(supportId).populate('user', 'fullName email');
    if (!supportEntry) {
      return NextResponse.json(
        { success: false, message: 'Support entry not found.' },
        { status: 404 }
      );
    }

    // Send email with the answer
    await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: supportEntry.user.email,
      subject: 'Answer to Your Support Query',
      html: `
        <p>Hi ${supportEntry.user.fullName},</p>
        <p>You asked:</p>
        <blockquote>${supportEntry.question}</blockquote>
        <p>We replied:</p>
        <blockquote>${answer}</blockquote>
        <p>Thanks,<br/>Support Team</p>
      `,
    });

    // Save answer to the support document
    supportEntry.answer = answer;
    supportEntry.updatedAt = new Date();
    await supportEntry.save();

    return NextResponse.json({ success: true, message: 'Email sent and answer saved.' });

  } catch (err) {
    console.error('Error sending answer:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
