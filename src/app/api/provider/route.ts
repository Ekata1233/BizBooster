import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/utils/db';
import imagekit from '@/utils/imagekit';
import Provider from '@/models/Provider';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Create Provider
export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
console.log(formData);

    // Extract fields
    const name = formData.get('name') as string;
    const phoneNo = formData.get('phoneNo') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;
    const companyLogoFile = formData.get('companyLogo') as File | null;
    const identityType = formData.get('identityType') as 'passport' | 'driving license' | 'other';
    const identityNumber = formData.get('identityNumber') as string;
    const identificationImageFile = formData.get('identificationImage') as File;
    const contactPersonName = formData.get('contactPerson.name') as string;
    const contactPersonPhoneNo = formData.get('contactPerson.phoneNo') as string;
    const contactPersonEmail = formData.get('contactPerson.email') as string;
    const accountEmail = formData.get('accountInformation.email') as string;
    const accountPhoneNo = formData.get('accountInformation.phoneNo') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const addressLatitude = Number(formData.get('addressLatitude'));
    const addressLongitude = Number(formData.get('addressLongitude'));
    const setBusinessPlan = formData.get('setBusinessPlan') as 'commission base' | 'other';

    if (!name || !phoneNo || !email || !address || !identityType || !identityNumber || !identificationImageFile || !contactPersonName || !contactPersonPhoneNo || !contactPersonEmail || !accountEmail || !accountPhoneNo || !password || !confirmPassword || !addressLatitude || !addressLongitude) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400, headers: corsHeaders });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: 'Passwords do not match' }, { status: 400, headers: corsHeaders });
    }

    // Upload identificationImage to ImageKit
    const identificationImageBuffer = Buffer.from(await identificationImageFile.arrayBuffer());
    const identificationImageUpload = await imagekit.upload({
      file: identificationImageBuffer,
      fileName: `${uuidv4()}-${identificationImageFile.name}`,
      folder: '/provider-identifications',
    });

    // Upload companyLogo if provided
    let companyLogoUrl = '';
    if (companyLogoFile) {
      const companyLogoBuffer = Buffer.from(await companyLogoFile.arrayBuffer());
      const companyLogoUpload = await imagekit.upload({
        file: companyLogoBuffer,
        fileName: `${uuidv4()}-${companyLogoFile.name}`,
        folder: '/provider-logos',
      });
      companyLogoUrl = companyLogoUpload.url;
    }

    // Create provider document
    const newProvider = await Provider.create({
      name,
      phoneNo,
      email,
      address,
      companyLogo: companyLogoUrl || undefined,
      identityType,
      identityNumber,
      identificationImage: identificationImageUpload.url,
      contactPerson: {
        name: contactPersonName,
        phoneNo: contactPersonPhoneNo,
        email: contactPersonEmail,
      },
      accountInformation: {
        email: accountEmail,
        phoneNo: accountPhoneNo,
      },
      password,
      confirmPassword, // only for validation, you can remove in your model if you want
      addressLatitude,
      addressLongitude,
      setBusinessPlan,
      isDeleted: false,
    });

    return NextResponse.json({ success: true, data: newProvider }, { status: 201, headers: corsHeaders });

  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
  }
}

// Get All Providers
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const providers = await Provider.find({ isDeleted: false }).lean();
    return NextResponse.json({ success: true, data: providers }, { status: 200, headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
  }
}
