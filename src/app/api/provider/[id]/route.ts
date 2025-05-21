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

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { searchParams, pathname } = new URL(req.url);
  const id = pathname.split('/').pop();

  try {
    const provider = await Provider.findById(id).lean();
    if (!provider) {
      return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json({ success: true, data: provider }, { status: 200, headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(req: NextRequest) {
  await connectToDatabase();

  const { pathname } = new URL(req.url);
  const id = pathname.split('/').pop();

  try {
    const formData = await req.formData();

    // Extract fields same as POST, but optional for updates
    const name = formData.get('name') as string | null;
    const phoneNo = formData.get('phoneNo') as string | null;
    const email = formData.get('email') as string | null;
    const address = formData.get('address') as string | null;
    const companyLogoFile = formData.get('companyLogo') as File | null;
    const identityType = formData.get('identityType') as 'passport' | 'driving license' | 'other' | null;
    const identityNumber = formData.get('identityNumber') as string | null;
    const identificationImageFile = formData.get('identificationImage') as File | null;
    const contactPersonName = formData.get('contactPersonName') as string | null;
    const contactPersonPhoneNo = formData.get('contactPersonPhoneNo') as string | null;
    const contactPersonEmail = formData.get('contactPersonEmail') as string | null;
    const accountEmail = formData.get('accountEmail') as string | null;
    const accountPhoneNo = formData.get('accountPhoneNo') as string | null;
    const password = formData.get('password') as string | null;
    const confirmPassword = formData.get('confirmPassword') as string | null;
    const addressLatitude = formData.get('addressLatitude') ? Number(formData.get('addressLatitude')) : null;
    const addressLongitude = formData.get('addressLongitude') ? Number(formData.get('addressLongitude')) : null;
    const setBusinessPlan = formData.get('setBusinessPlan') as 'commission base' | 'other' | null;

    const provider = await Provider.findById(id);
    if (!provider) {
      return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404, headers: corsHeaders });
    }

    if (password && confirmPassword && password !== confirmPassword) {
      return NextResponse.json({ success: false, message: 'Passwords do not match' }, { status: 400, headers: corsHeaders });
    }

    if (name) provider.name = name;
    if (phoneNo) provider.phoneNo = phoneNo;
    if (email) provider.email = email;
    if (address) provider.address = address;
    if (identityType) provider.identityType = identityType;
    if (identityNumber) provider.identityNumber = identityNumber;
    if (contactPersonName) provider.contactPerson.name = contactPersonName;
    if (contactPersonPhoneNo) provider.contactPerson.phoneNo = contactPersonPhoneNo;
    if (contactPersonEmail) provider.contactPerson.email = contactPersonEmail;
    if (accountEmail) provider.accountInformation.email = accountEmail;
    if (accountPhoneNo) provider.accountInformation.phoneNo = accountPhoneNo;
    if (addressLatitude !== null) provider.addressLatitude = addressLatitude;
    if (addressLongitude !== null) provider.addressLongitude = addressLongitude;
    if (setBusinessPlan) provider.setBusinessPlan = setBusinessPlan;
    if (password) provider.password = password;

    // Upload identificationImage if provided
    if (identificationImageFile) {
      const identificationImageBuffer = Buffer.from(await identificationImageFile.arrayBuffer());
      const identificationImageUpload = await imagekit.upload({
        file: identificationImageBuffer,
        fileName: `${uuidv4()}-${identificationImageFile.name}`,
        folder: '/provider-identifications',
      });
      provider.identificationImage = identificationImageUpload.url;
    }

    // Upload companyLogo if provided
    if (companyLogoFile) {
      const companyLogoBuffer = Buffer.from(await companyLogoFile.arrayBuffer());
      const companyLogoUpload = await imagekit.upload({
        file: companyLogoBuffer,
        fileName: `${uuidv4()}-${companyLogoFile.name}`,
        folder: '/provider-logos',
      });
      provider.companyLogo = companyLogoUpload.url;
    }

    await provider.save();

    return NextResponse.json({ success: true, data: provider }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(req: NextRequest) {
  await connectToDatabase();

  const { pathname } = new URL(req.url);
  const id = pathname.split('/').pop();

  try {
    const provider = await Provider.findById(id);
    if (!provider) {
      return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404, headers: corsHeaders });
    }
    provider.isDeleted = true;
    await provider.save();

    return NextResponse.json({ success: true, message: 'Provider deleted (soft delete)' }, { status: 200, headers: corsHeaders });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
  }
}
