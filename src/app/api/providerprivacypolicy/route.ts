import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/utils/db';
import ProviderPrivacyPolicy from '@/models/ProviderPrivacyPolicy';
import imagekit from '@/utils/imagekit';




const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ✅ GET all provider privacy policies
export async function GET() {
    await connectToDatabase();

    try {
        const policies = await ProviderPrivacyPolicy.find().populate({
            path: 'module',
            select: 'name image',
        });

        return NextResponse.json(
            { success: true, data: policies },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : 'Failed to fetch policies';
        return NextResponse.json(
            { success: false, message },
            { status: 500, headers: corsHeaders }
        );
    }
}


// export async function POST(req: NextRequest) {
//     await connectToDatabase();

//     try {
//         const formData = await req.formData();

//         const moduleId = formData.get('module')?.toString();
//         const content = formData.get('content')?.toString();


//         if (!moduleId || !content) {
//             return NextResponse.json(
//                 { success: false, message: 'Module and content are required.' },
//                 { status: 400, headers: corsHeaders }
//             );
//         }

//         const files = formData.getAll('documentFiles') as File[];

//         const documentUrls: string[] = [];

//         for (const file of files) {
//             if (file && file instanceof File && file.size > 0) {
//                 const buffer = Buffer.from(await file.arrayBuffer());

//                 const uploadResponse = await imagekit.upload({
//                     file: buffer,
//                     fileName: `${uuidv4()}-${file.name}`,
//                     folder: '/provider-policy-docs',
//                 });

//                 if (uploadResponse.url) {
//                     documentUrls.push(uploadResponse.url);
//                 }
//             }
//         }



//         const newPolicy = await ProviderPrivacyPolicy.create({
//             module: moduleId,
//             content,
//             documentUrls,
//         });

//         return NextResponse.json(
//             { success: true, data: newPolicy },
//             { status: 201, headers: corsHeaders }
//         );
//     } catch (error: unknown) {
//         const message =
//             error instanceof Error ? error.message : 'Failed to create policy';
//         return NextResponse.json(
//             { success: false, message },
//             { status: 500, headers: corsHeaders }
//         );
//     }
// }

// // ✅ OPTIONS for CORS preflight
// export async function OPTIONS() {
//     return NextResponse.json({}, { status: 200, headers: corsHeaders });
// }


export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const moduleId = formData.get('module')?.toString();
    const content = formData.get('content')?.toString();

    if (!moduleId || !content) {
      return NextResponse.json(
        { success: false, message: 'Module and content are required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const files = formData.getAll('documentFiles') as File[];
    const documentUrls: string[] = [];

    for (const file of files) {
      if (file && file instanceof File && file.size > 0) {
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

    // **Check if a policy already exists for this module**
    const existingPolicy = await ProviderPrivacyPolicy.findOne({ module: moduleId });

    if (existingPolicy) {
      // Update existing policy
      existingPolicy.content = content;
      if (documentUrls.length > 0) {
        existingPolicy.documentUrls = documentUrls;
      }
      await existingPolicy.save();

      return NextResponse.json(
        { success: true, data: existingPolicy, message: 'Policy updated successfully.' },
        { status: 200, headers: corsHeaders }
      );
    }

    // Create new policy if none exists
    const newPolicy = await ProviderPrivacyPolicy.create({
      module: moduleId,
      content,
      documentUrls,
    });

    return NextResponse.json(
      { success: true, data: newPolicy, message: 'Policy created successfully.' },
      { status: 201, headers: corsHeaders }
    );

  } catch (error: unknown) {
    console.error('POST /api/providerprivacypolicy error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to create/update policy';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}








