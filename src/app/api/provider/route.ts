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
    console.log("formdata of the provider : ",formData);

    // Extract fields
    const name = formData.get('companyName') as string;
    const phoneNo = formData.get('phoneNo') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;
    const zone = formData.get('zone') as string;
    const companyLogoFile = formData.get('logo') as File | null;
    const module = formData.get('selectedModule') as string;
    const identityType = formData.get('identityType') as 'passport' | 'driving license' | 'other';
    const identityNumber = formData.get('identity') as string;
    const identificationImageFile = formData.get('idImage') as File;
    const contactPersonName = formData.get('contactName') as string;
    const contactPersonPhoneNo = formData.get('contactPhone') as string;
    const contactPersonEmail = formData.get('contactEmail') as string;
    const accountEmail = formData.get('accountEmail') as string;
    const accountPhoneNo = formData.get('accountPhone') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const addressLatitude = Number(formData.get('latitude'));
    const addressLongitude = Number(formData.get('longitude'));
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
      zone,
      companyLogo: companyLogoUrl || undefined,
      module,
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
