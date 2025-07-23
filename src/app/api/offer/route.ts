// import { NextRequest, NextResponse } from 'next/server';
// import { writeFile, mkdir } from 'fs/promises';
// import path from 'path';
// import { connectToDatabase } from '@/utils/db';
// import Offer from '@/models/Offer';


// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// interface FAQItem {
//   question: string;
//   answer: string;
// }

// function isRecord(value: unknown): value is Record<string, unknown> {
//   return typeof value === 'object' && value !== null;
// }

// function stripHTML(html: string): string {
//   return html.replace(/<[^>]*>/g, '');
// }

// function normalizeFAQItem(it: unknown, idx: number): FAQItem | null {
//   if (typeof it === 'string') {
//     return { question: it, answer: '' };
//   }
//   if (isRecord(it)) {
//     const rawAnswer =
//       (typeof it.answer === 'string' && it.answer) ||
//       (typeof it.a === 'string' && it.a) ||
//       (typeof it.content === 'string' && it.content) ||
//       '';

//     const rawQuestion =
//       (typeof it.question === 'string' && it.question) ||
//       (typeof it.q === 'string' && it.q) ||
//       (typeof it.title === 'string' && it.title) ||
//       (rawAnswer
//         ? stripHTML(rawAnswer).slice(0, 60) + (rawAnswer.length > 60 ? '…' : '')
//         : `Question ${idx + 1}`);

//     return { question: rawQuestion, answer: rawAnswer };
//   }
//   return null;
// }

// function parseFAQFlexible(raw: unknown): FAQItem[] {
//   if (raw == null) return [];
//   if (Array.isArray(raw)) {
//     return raw
//       .map((item, idx) => normalizeFAQItem(item, idx))
//       .filter((v): v is FAQItem => !!v);
//   }
//   if (typeof raw === 'string') {
//     const trimmed = raw.trim();
//     if (!trimmed) return [];
//     try {
//       const parsed = JSON.parse(trimmed);
//       return parseFAQFlexible(parsed);
//     } catch {
//       return [{ question: 'FAQ', answer: trimmed }];
//     }
//   }
//   return [];
// }

// function parseDateFlexible(raw: string | null | undefined): Date | null {
//   if (!raw) return null;
//   let v = raw.trim();
//   if (/^\d{4}-\d{2}-\d{2}$/.test(v)) v = `${v}T00:00:00`;
//   const dmy = v.match(/^(\d{2})-(\d{2})-(\d{4})(?:[ T]|$)/);
//   if (dmy) {
//     const [, dd, mm, yyyy] = dmy;
//     v = `${yyyy}-${mm}-${dd}T00:00:00`;
//   }
//   const d = new Date(v);
//   return isNaN(d.getTime()) ? null : d;
// }

// async function storeFile(file: File, uploadDir: string, prefix: string) {
//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);
//   const safeName = file.name.replace(/\s+/g, '_');
//   const filename = `${Date.now()}-${prefix}-${safeName}`;
//   const filePath = path.join(uploadDir, filename);
//   await writeFile(filePath, buffer);
//   return `/uploads/${filename}`;
// }

// export async function GET() {
//   try {
//     await connectToDatabase();
//     const offers = await Offer.find().sort({ createdAt: -1 });
//     return NextResponse.json({ success: true, data: offers }, { status: 200, headers: corsHeaders });
//   } catch (error) {
//     console.error('GET Error:', error);
//     return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
//   }
// }






// export async function POST(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const formData = await req.formData();

//     const bannerImageFile = formData.get('bannerImage') as File | null;
//     const offerStartTimeRaw = formData.get('offerStartTime') as string | null;
//     const offerEndTimeRaw = formData.get('offerEndTime') as string | null;

//     const eligibilityCriteria = (formData.get('eligibilityCriteria') as string) || '';
//     const howToParticipate = (formData.get('howToParticipate') as string) || '';
//     const faqFields = formData.getAll('faq'); // can be one JSON string OR multiple
//     const termsAndConditions = (formData.get('termsAndConditions') as string) || '';

//     const start = parseDateFlexible(offerStartTimeRaw);
//     const end = parseDateFlexible(offerEndTimeRaw);
//     if (!start || !end) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid offerStartTime / offerEndTime' },
//         { status: 400, headers: corsHeaders }
//       );
//     }
//     if (end < start) {
//       return NextResponse.json(
//         { success: false, message: 'offerEndTime must be after offerStartTime' },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     let faq: FAQItem[] = [];
//     if (faqFields.length === 1) {
//       faq = parseFAQFlexible(faqFields[0]);
//     } else if (faqFields.length > 1) {
//       faq = faqFields.flatMap(f => parseFAQFlexible(f));
//     }

//     const galleryFiles = formData
//       .getAll('galleryImages')
//       .filter(f => f instanceof File) as File[];

//     const uploadDir = path.join(process.cwd(), 'public/uploads');
//     await mkdir(uploadDir, { recursive: true });

//     let bannerImage = '';
//     if (bannerImageFile) {
//       bannerImage = await storeFile(bannerImageFile, uploadDir, 'banner');
//     }

//     const galleryImages: string[] = [];
//     for (const file of galleryFiles) {
//       galleryImages.push(await storeFile(file, uploadDir, 'gallery'));
//     }

//     const newOffer = await Offer.create({
//       bannerImage,
//       offerStartTime: start,
//       offerEndTime: end,
//       galleryImages,
//       eligibilityCriteria,
//       howToParticipate,
//       faq,
//       termsAndConditions,
//     });

//     return NextResponse.json({ success: true, data: newOffer }, { status: 201, headers: corsHeaders });
//   } catch (error: unknown) {
//     let message = 'Internal Server Error';
//     if (error instanceof Error) {
//       message = error.message;
//     }
//     console.error('POST Error:', error);
//     return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
//   }
// }






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



/* ------------------------------------------------------------------
 * Utilities
 * ------------------------------------------------------------------ */
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;





function normalizeFAQItem(raw: unknown, idx: number): FAQItem | null {
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    return { question: `Question ${idx + 1}`, answer: trimmed };
  }
  if (isRecord(raw)) {
    const answer =
      (typeof raw.answer === 'string' && raw.answer) ||
      (typeof raw.a === 'string' && raw.a) ||
      (typeof raw.content === 'string' && raw.content) ||
      '';
    const question =
      (typeof raw.question === 'string' && raw.question) ||
      (typeof raw.q === 'string' && raw.q) ||
      (typeof raw.title === 'string' && raw.title) ||
      (answer ? stripHTML(answer).slice(0, 60) : `Question ${idx + 1}`);
    return { question, answer };
  }
  return null;
}







/* ------------------------------------------------------------------
 * GET /api/offer  (list all offers)
 * ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------
 * POST /api/offer  (create)
 * Expects multipart/form-data
 * ------------------------------------------------------------------ */

// export async function POST(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const formData = await req.formData();

//     /* ------------------ required fields ------------------ */
//     const bannerImageFile = formData.get('bannerImage');
//     const startRaw = formData.get('offerStartTime');
//     const endRaw = formData.get('offerEndTime');

//     // service: allow several param names
//     const rawService =
//       formData.get('service') ??
//       formData.get('serviceId') ??
//       formData.get('service_id');

//     const serviceId = typeof rawService === 'string' ? rawService.trim() : '';

//     if (!serviceId || !mongoose.isValidObjectId(serviceId)) {
//       return NextResponse.json(
//         { success: false, message: 'Valid service ID is required.' },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     if (!(bannerImageFile instanceof File) || bannerImageFile.size === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Banner image file is required.' },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const start = parseDateFlexible(typeof startRaw === 'string' ? startRaw : null);
//     const end = parseDateFlexible(typeof endRaw === 'string' ? endRaw : null);
//     if (!start || !end) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid offerStartTime / offerEndTime.' },
//         { status: 400, headers: corsHeaders }
//       );
//     }
//     if (end <= start) {
//       return NextResponse.json(
//         { success: false, message: 'offerEndTime must be after offerStartTime.' },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     /* ------------------ optional rich text fields ------------------ */
//     const eligibilityCriteria =
//       (typeof formData.get('eligibilityCriteria') === 'string'
//         ? (formData.get('eligibilityCriteria') as string)
//         : '') || '';
//     const howToParticipate =
//       (typeof formData.get('howToParticipate') === 'string'
//         ? (formData.get('howToParticipate') as string)
//         : '') || '';
//     const termsAndConditions =
//       (typeof formData.get('termsAndConditions') === 'string'
//         ? (formData.get('termsAndConditions') as string)
//         : '') || '';

//     /* ------------------ FAQ ------------------ */
//     // Accept 1) repeated faq fields, 2) single JSON, 3) faqQuestion[] + faqAnswer[]
//     const faqFields = formData.getAll('faq');
//     const faqQFields = formData.getAll('faqQuestion');
//     const faqAFields = formData.getAll('faqAnswer');

//     let faq: FAQItem[] = [];
//     if (faqFields.length) {
//       if (faqFields.length === 1) {
//         faq = parseFAQFlexible(faqFields[0]);
//       } else {
//         faq = faqFields.flatMap((f) => parseFAQFlexible(f));
//       }
//     } else if (faqQFields.length || faqAFields.length) {
//       faq = parseFAQFromPairs(faqQFields, faqAFields);
//     }

//     /* ------------------ gallery images ------------------ */
//     const galleryFiles = formData
//       .getAll('galleryImages')
//       .filter((f): f is File => f instanceof File && f.size > 0);

//     /* ------------------ upload banner ------------------ */
//     const bannerBuf = await fileToBuffer(bannerImageFile as File);
//     const bannerUpload = await imagekit.upload({
//       file: bannerBuf,
//       fileName: `offer-banner-${Date.now()}-${(bannerImageFile as File).name}`,
//       folder: '/offers/banner',
//     });
//     const bannerImage = bannerUpload.url;

//     /* ------------------ upload gallery ------------------ */
//     const galleryImages: string[] = [];
//     for (const gf of galleryFiles) {
//       const gfBuf = await fileToBuffer(gf);
//       const up = await imagekit.upload({
//         file: gfBuf,
//         fileName: `offer-gallery-${Date.now()}-${gf.name}`,
//         folder: '/offers/gallery',
//       });
//       galleryImages.push(up.url);
//     }

//     /* ------------------ persist ------------------ */
//     const newOffer = await Offer.create({
//       bannerImage,
//       offerStartTime: start,
//       offerEndTime: end,
//       galleryImages,
//       eligibilityCriteria,
//       howToParticipate,
//       faq,
//       termsAndConditions,
//       service: new mongoose.Types.ObjectId(serviceId),
//     });

//     // populate service for response convenience
//     await newOffer.populate({ path: 'service', select: 'serviceName name _id' });

//     return NextResponse.json(
//       { success: true, data: newOffer },
//       { status: 201, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     console.error('POST /api/offer error:', error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: error instanceof Error ? error.message : 'Internal Server Error',
//       },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }



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
    return raw.flatMap((v, i) => parseFAQFlexible(v));
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
    const anyRaw = raw as any;
    const answer =
      typeof anyRaw.answer === 'string' ? anyRaw.answer :
      typeof anyRaw.a === 'string'      ? anyRaw.a :
      typeof anyRaw.content === 'string'? anyRaw.content : '';

    const question =
      typeof anyRaw.question === 'string' ? anyRaw.question :
      typeof anyRaw.q === 'string'        ? anyRaw.q :
      typeof anyRaw.title === 'string'    ? anyRaw.title :
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