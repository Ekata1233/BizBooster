// import { NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '@/utils/db';
// import  Offer  from '@/models/Offer';
// import { mkdir, writeFile } from 'fs/promises';
// import path from 'path';

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// // ✅ GET all offers

// // ✅ POST create new offer

// // export async function POST(req: NextRequest) {
// //   await connectToDatabase();

// //   try {
// //     const formData = await req.formData();
// //     const bannerImageFile = formData.get('bannerImage') as File | null;
// //     const offerStartTime = formData.get('offerStartTime') as string;
// //     const offerEndTime = formData.get('offerEndTime') as string;
// //     const eligibilityCriteria = formData.get('eligibilityCriteria') as string;
// //     const howToParticipate = formData.get('howToParticipate') as string;
// //     const faq = formData.get('faq') as string;
// //     const termsAndConditions = formData.get('termsAndConditions') as string;

// //     // Gallery Images
// //     const galleryFiles = formData.getAll('galleryImages') as File[];

// //     const uploadDir = path.join(process.cwd(), 'public/uploads');
// //     await mkdir(uploadDir, { recursive: true });

// //     // ✅ Save banner image
// //     let bannerImagePath = '';
// //     if (bannerImageFile) {
// //       const buffer = Buffer.from(await bannerImageFile.arrayBuffer());
// //       const filename = `${Date.now()}-${bannerImageFile.name}`;
// //       const filePath = path.join(uploadDir, filename);
// //       await writeFile(filePath, buffer);
// //       bannerImagePath = `/uploads/${filename}`;
// //     }

// //     // ✅ Save gallery images
// //     const galleryPaths: string[] = [];
// //     for (const file of galleryFiles) {
// //       const buffer = Buffer.from(await file.arrayBuffer());
// //       const filename = `${Date.now()}-${file.name}`;
// //       const filePath = path.join(uploadDir, filename);
// //       await writeFile(filePath, buffer);
// //       galleryPaths.push(`/uploads/${filename}`);
// //     }

// //     const newOffer = await Offer.create({
// //       bannerImage: bannerImagePath,
// //       offerStartTime,
// //       offerEndTime,
// //       galleryImages: galleryPaths,
// //       eligibilityCriteria,
// //       howToParticipate,
// //       faq,
// //       termsAndConditions,
// //     });

// //     return NextResponse.json({ success: true, data: newOffer }, { status: 201 });
// //   } catch (error) {
// //     console.error('POST Error:', error);
// //     return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
// //   }
// // }




// // ------------- Helpers -------------
// function parseDateFlexible(raw: string | null | undefined): Date | null {
//   if (!raw) return null;
//   let v = raw.trim();

//   // If user passed just date (YYYY-MM-DD) -> treat as midnight
//   if (/^\d{4}-\d{2}-\d{2}$/.test(v)) v = `${v}T00:00:00`;

//   // Support dd-mm-yyyy
//   const dmy = v.match(/^(\d{2})-(\d{2})-(\d{4})(?:[ T]|$)/);
//   if (dmy) {
//     const [, dd, mm, yyyy] = dmy;
//     v = `${yyyy}-${mm}-${dd}T00:00:00`;
//   }

//   const d = new Date(v);
//   if (isNaN(d.getTime())) return null;
//   return d;
// }

// interface FAQItem {
//   question: string;
//   answer: string;
// }

// function parseFAQFlexible(raw: unknown): FAQItem[] {
//   if (raw == null) return [];

//   // If already an array (rare in FormData but possible in JSON request)
//   if (Array.isArray(raw)) {
//     return raw
//       .map((it, idx) => normalizeFAQItem(it, idx))
//       .filter(Boolean) as FAQItem[];
//   }

//   if (typeof raw === 'string') {
//     const trimmed = raw.trim();
//     if (!trimmed) return [];
//     // Try JSON
//     try {
//       const parsed = JSON.parse(trimmed);
//       return parseFAQFlexible(parsed);
//     } catch {
//       // Treat entire string as a single FAQ answer blob
//       return [{ question: 'FAQ', answer: trimmed }];
//     }
//   }

//   // Fallback
//   return [];
// }

// function normalizeFAQItem(it: any, idx: number): FAQItem | null {
//   if (typeof it === 'string') {
//     return { question: it || `Question ${idx + 1}`, answer: '' };
//   }
//   if (typeof it === 'object' && it !== null) {
//     const q =
//       it.question ||
//       it.q ||
//       it.title ||
//       (typeof it.answer === 'string'
//         ? stripHTML(it.answer).slice(0, 60) + '…'
//         : `Question ${idx + 1}`);
//     const a = it.answer || it.a || it.content || '';
//     return { question: String(q), answer: String(a) };
//   }
//   return null;
// }

// function stripHTML(html: string): string {
//   return html.replace(/<[^>]*>/g, '');
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

// // ------------- POST (Create Offer) -------------
// export async function POST(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const formData = await req.formData();

//     const bannerImageFile = formData.get('bannerImage') as File | null;

//     const offerStartTimeRaw = formData.get('offerStartTime') as string | null;
//     const offerEndTimeRaw = formData.get('offerEndTime') as string | null;

//     const eligibilityCriteria = (formData.get('eligibilityCriteria') as string) || '';
//     const howToParticipate = (formData.get('howToParticipate') as string) || '';
//     const faqRaw = formData.getAll('faq'); 
//     // Note: if you sent single 'faq' entry, faqRaw will be [string]; if multiple appended, it's an array.

//     const termsAndConditions = (formData.get('termsAndConditions') as string) || '';

//     // Parse dates
//     const startDate = parseDateFlexible(offerStartTimeRaw);
//     const endDate = parseDateFlexible(offerEndTimeRaw);

//     if (!startDate || !endDate) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid or missing offerStartTime / offerEndTime.' },
//         { status: 400 }
//       );
//     }
//     if (endDate < startDate) {
//       return NextResponse.json(
//         { success: false, message: 'offerEndTime must be after offerStartTime.' },
//         { status: 400 }
//       );
//     }

//     // Parse FAQ (could be one combined string or multiple strings)
//     // If multiple faq fields were appended, merge them.
//     let faqCombined: FAQItem[] = [];
//     if (faqRaw.length === 1) {
//       faqCombined = parseFAQFlexible(faqRaw[0]);
//     } else if (faqRaw.length > 1) {
//       faqCombined = faqRaw.flatMap(r => parseFAQFlexible(r));
//     }

//     // Gallery images
//     const galleryFiles = formData.getAll('galleryImages').filter(f => f instanceof File) as File[];

//     const uploadDir = path.join(process.cwd(), 'public/uploads');
//     await mkdir(uploadDir, { recursive: true });

//     // Save banner
//     let bannerImagePath = '';
//     if (bannerImageFile) {
//       bannerImagePath = await storeFile(bannerImageFile, uploadDir, 'banner');
//     }

//     // Save gallery
//     const galleryPaths: string[] = [];
//     for (const gf of galleryFiles) {
//       const stored = await storeFile(gf, uploadDir, 'gallery');
//       galleryPaths.push(stored);
//     }

//     // Create Offer
//     const newOffer = await Offer.create({
//       bannerImage: bannerImagePath,
//       offerStartTime: startDate,
//       offerEndTime: endDate,
//       galleryImages: galleryPaths,
//       eligibilityCriteria,
//       howToParticipate,
//       faq: faqCombined, // MUST be array
//       termsAndConditions,
//     });

//     return NextResponse.json({ success: true, data: newOffer }, { status: 201 });
//   } catch (error: any) {
//     console.error('POST Error:', error);
//     // Give Mongoose validation message if available
//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error?.name === 'ValidationError'
//             ? error.message
//             : 'Internal Server Error',
//       },
//       { status: 500 }
//     );
//   }
// }











import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { connectToDatabase } from '@/utils/db';
import Offer from '@/models/Offer';

interface FAQItem {
  question: string;
  answer: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function normalizeFAQItem(it: unknown, idx: number): FAQItem | null {
  if (typeof it === 'string') {
    return { question: it, answer: '' };
  }
  if (isRecord(it)) {
    const rawAnswer =
      (typeof it.answer === 'string' && it.answer) ||
      (typeof it.a === 'string' && it.a) ||
      (typeof it.content === 'string' && it.content) ||
      '';

    const rawQuestion =
      (typeof it.question === 'string' && it.question) ||
      (typeof it.q === 'string' && it.q) ||
      (typeof it.title === 'string' && it.title) ||
      (rawAnswer
        ? stripHTML(rawAnswer).slice(0, 60) + (rawAnswer.length > 60 ? '…' : '')
        : `Question ${idx + 1}`);

    return { question: rawQuestion, answer: rawAnswer };
  }
  return null;
}

function parseFAQFlexible(raw: unknown): FAQItem[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item, idx) => normalizeFAQItem(item, idx))
      .filter((v): v is FAQItem => !!v);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return parseFAQFlexible(parsed);
    } catch {
      return [{ question: 'FAQ', answer: trimmed }];
    }
  }
  return [];
}

function parseDateFlexible(raw: string | null | undefined): Date | null {
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
}

async function storeFile(file: File, uploadDir: string, prefix: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = file.name.replace(/\s+/g, '_');
  const filename = `${Date.now()}-${prefix}-${safeName}`;
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}

export async function GET() {
  try {
    await connectToDatabase();
    const offers = await Offer.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: offers }, { status: 200 });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const bannerImageFile = formData.get('bannerImage') as File | null;
    const offerStartTimeRaw = formData.get('offerStartTime') as string | null;
    const offerEndTimeRaw = formData.get('offerEndTime') as string | null;

    const eligibilityCriteria = (formData.get('eligibilityCriteria') as string) || '';
    const howToParticipate = (formData.get('howToParticipate') as string) || '';
    const faqFields = formData.getAll('faq'); // can be one JSON string OR multiple
    const termsAndConditions = (formData.get('termsAndConditions') as string) || '';

    const start = parseDateFlexible(offerStartTimeRaw);
    const end = parseDateFlexible(offerEndTimeRaw);
    if (!start || !end) {
      return NextResponse.json(
        { success: false, message: 'Invalid offerStartTime / offerEndTime' },
        { status: 400 }
      );
    }
    if (end < start) {
      return NextResponse.json(
        { success: false, message: 'offerEndTime must be after offerStartTime' },
        { status: 400 }
      );
    }

    let faq: FAQItem[] = [];
    if (faqFields.length === 1) {
      faq = parseFAQFlexible(faqFields[0]);
    } else if (faqFields.length > 1) {
      faq = faqFields.flatMap(f => parseFAQFlexible(f));
    }

    const galleryFiles = formData
      .getAll('galleryImages')
      .filter(f => f instanceof File) as File[];

    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });

    let bannerImage = '';
    if (bannerImageFile) {
      bannerImage = await storeFile(bannerImageFile, uploadDir, 'banner');
    }

    const galleryImages: string[] = [];
    for (const file of galleryFiles) {
      galleryImages.push(await storeFile(file, uploadDir, 'gallery'));
    }

    const newOffer = await Offer.create({
      bannerImage,
      offerStartTime: start,
      offerEndTime: end,
      galleryImages,
      eligibilityCriteria,
      howToParticipate,
      faq,
      termsAndConditions,
    });

    return NextResponse.json({ success: true, data: newOffer }, { status: 201 });
  } catch (error: unknown) {
    let message = 'Internal Server Error';
    if (error instanceof Error) {
      message = error.message;
    }
    console.error('POST Error:', error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
