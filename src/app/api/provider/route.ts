import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/utils/db';
import imagekit from '@/utils/imagekit';
import Provider from '@/models/Provider';
import '@/models/Module';
import { providerValidationSchema } from '@/validation/providerValidationSchema';
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}


export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    console.log("formdata of the provider : ", formData);

    // Extract basic fields
    const fullName = formData.get('fullName') as string;
    const phoneNo = formData.get('phoneNo') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const referredBy = formData.get('referredBy') as string | null;
    const setBusinessPlan = formData.get('setBusinessPlan') as 'commission base' | 'other';

    // Validate required fields
    if (!fullName || !phoneNo || !email || !password || !confirmPassword) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: 'Passwords do not match' }, { status: 400 });
    }

    // Extract storeInfo fields
    const storeName = formData.get('storeName') as string;
    const storePhone = formData.get('storePhone') as string;
    const storeEmail = formData.get('storeEmail') as string;
    const moduleValue = formData.get('selectedModule') as string;
    const zone = formData.get('zone') as string;
    const tax = formData.get('tax') as string;
    const locationType = formData.get('locationType') as string;
    const longitude = parseFloat(formData.get('longitude') as string);
    const latitude = parseFloat(formData.get('latitude') as string);
    const address = formData.get('address') as string;
    const officeNo = formData.get('officeNo') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const country = formData.get('country') as string;

    // Upload logo
    let logoUrl = '';
    const logo = formData.get('logo') as File | null;
    if (logo) {
      const logoBuffer = Buffer.from(await logo.arrayBuffer());
      const logoUpload = await imagekit.upload({
        file: logoBuffer,
        fileName: `${uuidv4()}-${logo.name}`,
        folder: '/provider-logos',
      });
      logoUrl = logoUpload.url;
    }

    // Upload cover
    let coverUrl = '';
    const cover = formData.get('cover') as File | null;
    if (cover) {
      const coverBuffer = Buffer.from(await cover.arrayBuffer());
      const coverUpload = await imagekit.upload({
        file: coverBuffer,
        fileName: `${uuidv4()}-${cover.name}`,
        folder: '/provider-covers',
      });
      coverUrl = coverUpload.url;
    }

    // Upload KYC documents
    const uploadFiles = async (files: File[] | FileList): Promise<string[]> => {
      const urls: string[] = [];
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const upload = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${file.name}`,
          folder: '/provider-documents',
        });
        urls.push(upload.url);
      }
      return urls;
    };

    const aadhaarCardFiles = formData.getAll('aadhaarCard') as File[];
    const panCardFiles = formData.getAll('panCard') as File[];
    const storeDocumentFiles = formData.getAll('storeDocument') as File[];
    const gstFiles = formData.getAll('GST') as File[];
    const otherFiles = formData.getAll('other') as File[];

    const [aadhaarCard, panCard, storeDocument, GST, other] = await Promise.all([
      uploadFiles(aadhaarCardFiles),
      uploadFiles(panCardFiles),
      uploadFiles(storeDocumentFiles),
      uploadFiles(gstFiles),
      uploadFiles(otherFiles),
    ]);

    // Assemble the data object
    const data = {
      fullName,
      phoneNo,
      email,
      password,
      confirmPassword,
      referredBy: referredBy || undefined,
      storeInfo: {
        storeName,
        storePhone,
        storeEmail,
        module: moduleValue,
        zone,
        logo: logoUrl,
        cover: coverUrl,
        tax,
        location: {
          type: locationType,
          coordinates: [longitude, latitude],
        },
        address,
        officeNo,
        city,
        state,
        country,
      },
      kyc: {
        aadhaarCard,
        panCard,
        storeDocument,
        GST,
        other,
      },
      setBusinessPlan,
      isDeleted: false,
    };

    // Validate the structured data
    const parsedData = providerValidationSchema.parse(data);

    // Generate unique referral code
    function generateReferralCode(length = 6) {
      return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
    }

    let referralCode: string = '';
    let exists = true;

    while (exists) {
      referralCode = generateReferralCode();
      const existing = await Provider.findOne({ referralCode });
      if (!existing) exists = false;
    }

    // Handle referredBy
    let referredById = null;
    if (parsedData.referredBy) {
      const referringUser = await Provider.findOne({ referralCode: parsedData.referredBy });
      if (!referringUser) {
        return NextResponse.json(
          { error: 'Referral code is not valid' },
          { status: 400 }
        );
      }
      referredById = referringUser._id;
    }

    // Create provider document
    const newProvider = await Provider.create({
      fullName: parsedData.fullName,
      phoneNo: parsedData.phoneNo,
      email: parsedData.email,
      password: parsedData.password,
      confirmPassword: parsedData.confirmPassword,
      referredBy: referredById,
      storeInfo: parsedData.storeInfo,
      kyc: parsedData.kyc,
      businessPlan: parsedData.setBusinessPlan,
      isDeleted: parsedData.isDeleted,
    });

    return NextResponse.json({ success: true, data: newProvider }, { status: 201 });

  } catch (error: unknown) {
      console.error('Error saving user:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
  
      return NextResponse.json(
        { error: message },
        { status: 400, headers: corsHeaders }
      );
    }
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort');
    const search = searchParams.get('search');
    const selectedModule = searchParams.get('selectedModule');

    console.log("search in backend : ", searchParams);

    // Construct filter object
    const filter: {
      isDeleted: boolean;
      module?: string;
      $or?: { [key: string]: { $regex: string; $options: string } }[];
    } = {
      isDeleted: false,
    };

    // If selectedModule is provided
    if (selectedModule) {
      filter.module = selectedModule;
    }

    // Search logic
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    // Sorting logic
    let sortOption: Record<string, 1 | -1> = {};
    switch (sort) {
      case 'latest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'ascending':
        sortOption = { fullName: 1 };
        break;
      case 'descending':
        sortOption = { fullName: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Apply filter and sort
    const providers = await Provider.find(filter)
      .sort(sortOption)
      .lean();

    return NextResponse.json(
      { success: true, data: providers },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
