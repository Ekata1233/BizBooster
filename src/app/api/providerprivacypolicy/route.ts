import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/utils/db';
import ProviderPrivacyPolicy from '@/models/ProviderPrivacyPolicy';
import imagekit from '@/utils/imagekit';
import Module from '@/models/Module';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ✅ OPTIONS - CORS Preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ✅ POST - Create Provider Privacy Policy with File Upload
export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const moduleId = formData.get('module') as string;
    const content = formData.get('content') as string;

    if (!moduleId || !content) {
      return NextResponse.json(
        { success: false, message: 'Module and content are required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const files = formData.getAll('documentFiles') as File[];
    const documentUrls: string[] = [];

    for (const file of files) {
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${file.name}`,
          folder: '/provider-policy-docs',
        });

        if (uploadResponse.url) {
          documentUrls.push(uploadResponse.url);
        }
      }
    }

    const newPolicy = await ProviderPrivacyPolicy.create({
      module: moduleId,
      content,
      documentUrls,
    });

    return NextResponse.json(
      { success: true, data: newPolicy },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ GET - Fetch All Provider Policies (with optional search)
export async function GET(req: NextRequest) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');

  const filter: any = {};

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    filter.$or = [
      { content: searchRegex },
    ];
  }

  try {
    const policies = await ProviderPrivacyPolicy.find(filter).populate({
      path: 'module',
      select: 'name image',
    });

    return NextResponse.json(
      { success: true, data: policies },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
