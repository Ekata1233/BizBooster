import { NextResponse } from 'next/server';
import Banner from '@/models/Banner';
import imagekit from '@/utils/imagekit';
import { connectToDatabase } from '@/utils/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  try {
    const banner = await Banner.findById(params.id);
    return NextResponse.json(banner);
  } catch {
    return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  try {
    const formData = await req.formData();
    const updates: any = {
      page: formData.get('page'),
      selectionType: formData.get('selectionType'),
      category: formData.get('category') || undefined,
      subcategory: formData.get('subcategory') || undefined,
      service: formData.get('service') || undefined,
      referralUrl: formData.get('referralUrl') || undefined,
    };

    const file = formData.get('file');
    if (file && typeof file !== 'string') {
      const buffer = Buffer.from(await (file as File).arrayBuffer());
      const upload = await imagekit.upload({
        file: buffer,
        fileName: `banner_update_${Date.now()}`,
      });
      updates.file = upload.url;
    }

    const updated = await Banner.findByIdAndUpdate(params.id, updates, { new: true });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  try {
    await Banner.findByIdAndUpdate(params.id, { isDeleted: true });
    return NextResponse.json({ message: 'Banner deleted' });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
