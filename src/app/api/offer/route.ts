// src/app/api/offer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/utils/db';
import imagekit from '@/utils/imagekit';
import Offer from '@/models/Offer';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}


export async function GET() {
  try {
    await connectToDatabase();
    const offers = await Offer.find().populate({
      path: 'service',
      select: 'serviceName name _id', // adapt to your Service schema
    }).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: offers },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('GET /api/offer error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}




type FAQItem = { question: string; answer: string };

const stripHTML = (html: string) => html.replace(/<[^>]*>/g, '');

const parseDateFlexible = (raw: string | null): Date | null => {
  if (!raw) return null;
  let v = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) v = `${v}T00:00:00`;
  const dmy = v.match(/^(\d{2})-(\d{2})-(\d{4})(?:[ T]|$)/);
  if (dmy) {
    const [, dd, mm, yyyy] = dmy;
    v = `${yyyy}-${mm}-${dd}T00:00:00`;
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

const fileToBuffer = async (file: File) => Buffer.from(await file.arrayBuffer());

/** Accept: FormDataEntryValue (string or File), array forms, JSON, etc. */
function parseFAQFlexible(raw: unknown): FAQItem[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.flatMap((v, ) => parseFAQFlexible(v));
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return parseFAQFlexible(parsed);
    } catch {
      // treat as single blob answer
      return [{
        question: 'FAQ',
        answer: trimmed,
      }];
    }
  }
  if (typeof raw === 'object') {
    const objRaw = raw as Record<string, unknown>;
    const answer =
      typeof objRaw.answer === 'string' ? objRaw.answer :
      typeof objRaw.a === 'string'      ? objRaw.a :
      typeof objRaw.content === 'string'? objRaw.content : '';

    const question =
      typeof objRaw.question === 'string' ? objRaw.question :
      typeof objRaw.q === 'string'        ? objRaw.q :
      typeof objRaw.title === 'string'    ? objRaw.title :
      (answer ? stripHTML(answer).slice(0, 60) : 'FAQ');

    return [{ question, answer }];
  }
  return [];
}

/** Accept paired faqQuestion[] + faqAnswer[] fields from FormData. */
function parseFAQFromPairs(qs: FormDataEntryValue[], as: FormDataEntryValue[]): FAQItem[] {
  const max = Math.max(qs.length, as.length);
  const out: FAQItem[] = [];
  for (let i = 0; i < max; i++) {
    const q = typeof qs[i] === 'string' ? (qs[i] as string).trim() : '';
    const a = typeof as[i] === 'string' ? (as[i] as string).trim() : '';
    out.push({ question: q, answer: a });
  }
  return out;
}

/** Ensure every FAQ has nonempty question & answer. Drop empties. */
function sanitizeFAQ(items: FAQItem[]): FAQItem[] {
  const cleaned: FAQItem[] = [];
  for (let i = 0; i < items.length; i++) {
    let q = (items[i].question ?? '').trim();
    let a = (items[i].answer ?? '').trim();

    // drop rows totally empty
    if (!q && !a) continue;

    // supply fallback text if one side empty (avoids Mongoose required error)
    if (!q) q = `Question ${i + 1}`;
    if (!a) a = 'Answer coming soon.'; // <--- fallback so validation passes

    cleaned.push({ question: q, answer: a });
  }
  return cleaned;
}

/* ---------------- route ---------------- */

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    /* required ------------------------- */
    const bannerImageFile = formData.get('bannerImage');
    const thumbnailImageFile = formData.get('thumbnailImage');
    const startRaw = formData.get('offerStartTime');
    const endRaw = formData.get('offerEndTime');

    const rawService =
      formData.get('service') ??
      formData.get('serviceId') ??
      formData.get('service_id');

    const serviceId = typeof rawService === 'string' ? rawService.trim() : '';

    if (!serviceId || !mongoose.isValidObjectId(serviceId)) {
      return NextResponse.json(
        { success: false, message: 'Valid service ID is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!(bannerImageFile instanceof File) || bannerImageFile.size === 0) {
      return NextResponse.json(
        { success: false, message: 'Banner image file is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const start = parseDateFlexible(typeof startRaw === 'string' ? startRaw : null);
    const end   = parseDateFlexible(typeof endRaw === 'string' ? endRaw : null);

    if (!start || !end) {
      return NextResponse.json(
        { success: false, message: 'Invalid offerStartTime / offerEndTime.' },
        { status: 400, headers: corsHeaders }
      );
    }
    if (end <= start) {
      return NextResponse.json(
        { success: false, message: 'offerEndTime must be after offerStartTime.' },
        { status: 400, headers: corsHeaders }
      );
    }

    /* optional rich text ---------------- */
    const eligibilityCriteria =
      typeof formData.get('eligibilityCriteria') === 'string'
        ? (formData.get('eligibilityCriteria') as string)
        : '';
    const howToParticipate =
      typeof formData.get('howToParticipate') === 'string'
        ? (formData.get('howToParticipate') as string)
        : '';
    const termsAndConditions =
      typeof formData.get('termsAndConditions') === 'string'
        ? (formData.get('termsAndConditions') as string)
        : '';

    /* FAQ ------------------------------- */
    const faqFields  = formData.getAll('faq');
    const faqQFields = formData.getAll('faqQuestion');
    const faqAFields = formData.getAll('faqAnswer');

    let faq: FAQItem[] = [];
    if (faqFields.length) {
      faq = faqFields.length === 1
        ? parseFAQFlexible(faqFields[0])
        : faqFields.flatMap((f) => parseFAQFlexible(f));
    } else if (faqQFields.length || faqAFields.length) {
      faq = parseFAQFromPairs(faqQFields, faqAFields);
    }

    const sanitizedFaq = sanitizeFAQ(faq); // <-- critical

    /* gallery --------------------------- */
    const galleryFiles = formData
      .getAll('galleryImages')
      .filter((f): f is File => f instanceof File && f.size > 0);

    /* upload banner --------------------- */
    const bannerBuf = await fileToBuffer(bannerImageFile as File);
    const bannerUpload = await imagekit.upload({
      file: bannerBuf,
      fileName: `offer-banner-${Date.now()}-${(bannerImageFile as File).name}`,
      folder: '/offers/banner',
    });
    const bannerImage = bannerUpload.url;

      /* upload thumbnail --------------------- */

      const thumbnailBuf = await fileToBuffer(thumbnailImageFile as File);
    const thumbnailUpload = await imagekit.upload({
      file: thumbnailBuf,
      fileName: `offer-banner-${Date.now()}-${(thumbnailImageFile as File).name}`,
      folder: '/offers/banner',
    });
    const thumbnailImage = thumbnailUpload.url;

    /* upload gallery -------------------- */
    const galleryImages: string[] = [];
    for (const gf of galleryFiles) {
      const gfBuf = await fileToBuffer(gf);
      const up = await imagekit.upload({
        file: gfBuf,
        fileName: `offer-gallery-${Date.now()}-${gf.name}`,
        folder: '/offers/gallery',
      });
      galleryImages.push(up.url);
    }

    /* persist --------------------------- */
    const newOffer = await Offer.create({
      bannerImage,
      thumbnailImage,
      offerStartTime: start,
      offerEndTime: end,
      galleryImages,
      eligibilityCriteria,
      howToParticipate,
      faq: sanitizedFaq, // <-- safe
      termsAndConditions,
      service: new mongoose.Types.ObjectId(serviceId),
    });

    await newOffer.populate({ path: 'service', select: 'serviceName name _id' });

    return NextResponse.json(
      { success: true, data: newOffer },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('POST /api/offer error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}