import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import ProviderPrivacyPolicy from '@/models/ProviderPrivacyPolicy';
import imagekit from '@/utils/imagekit';
import { v4 as uuidv4 } from 'uuid';
import { Types } from 'mongoose';

export const runtime = 'edge';


const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function PUT(req: NextRequest) {
    await connectToDatabase();

    try {
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop() as string;

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
        }

        const formData = await req.formData();
        const content = formData.get('content')?.toString();
        const moduleId = formData.get('module')?.toString();
        const files = formData.getAll('documentFiles') as File[];

        if (!content || !moduleId) {
            return NextResponse.json(
                { success: false, message: 'Content and module are required' },
                { status: 400, headers: corsHeaders }
            );
        }

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

        const updateFields: {
            content: string;
            module: string;
            documentUrls?: string[];
        } = {
            content,
            module: moduleId,
        };

        if (documentUrls.length > 0) {
            updateFields.documentUrls = documentUrls;
        }

        const updated = await ProviderPrivacyPolicy.findByIdAndUpdate(id, updateFields, {
            new: true,
        });

        if (!updated) {
            return NextResponse.json({ success: false, message: 'Policy not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updated }, { headers: corsHeaders });
    } catch (err) {
        console.error('PUT error:', err);
        return NextResponse.json(
            { success: false, message: 'Failed to update' },
            { status: 500, headers: corsHeaders }
        );
    }
}

export async function DELETE(req: NextRequest) {
    await connectToDatabase();

    try {
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop() as string;

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
        }

        const deleted = await ProviderPrivacyPolicy.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ success: false, message: 'Entry not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        console.error('DELETE error:', err);
        return NextResponse.json({ success: false, message: 'Failed to delete' }, { status: 500 });
    }
}
