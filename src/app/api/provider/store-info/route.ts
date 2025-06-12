/**
 * src/app/api/provider/store-info/route.ts
 *
 * Handles:
 *   PUT  – save / update provider storeInfo (text + logo + cover)
 *   OPTIONS – CORS pre-flight
 *
 * Runtime: Node (needed for Buffer)
 */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { getUserIdFromRequest } from "@/utils/auth";
import Provider from "@/models/Provider";
import imagekit from "@/utils/imagekit";
import { v4 as uuid } from "uuid";
import '@/models/Zone'
import '@/models/Module'

/** Ensure this route uses the Node runtime, not the Edge runtime */
export const runtime = "nodejs";

/** ---- helpers ----------------------------------------------------------- */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

// ✅ Handle preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
/** Convert a File (from formData) to an ImageKit URL */
async function uploadToImageKit(
  providerId: string,
  key: "logo" | "cover",
  file: File,
) {
  // File ⇒ Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // e.g. "logo-6c4d1fe2.png"
  const fileName = `${key}-${uuid()}.${file.type.split("/")[1]}`;

  const res = await imagekit.upload({
    file: buffer,                   // raw file bytes
    fileName,
    folder: `/providers/${providerId}`,
    useUniqueFileName: false,       // we already append uuid
  });

  return res.url;                   // public CDN URL
}

/** Parse multipart/form-data into a plain object, uploading files if present */
async function parseFormAndUpload(
  req: NextRequest,
  providerId: string,
): Promise<Record<string, any>> {
  const fd = await req.formData();
  const storeInfo: Record<string, any> = {};

  // Handle text fields first
  for (const [key, value] of fd.entries()) {
    if (value instanceof File) continue;      // files handled below
    try {
      storeInfo[key] = JSON.parse(value as string); // allow JSON strings
    } catch {
      storeInfo[key] = value;                 // plain string
    }
  }

  // Handle logo / cover files
  for (const key of ["logo", "cover"] as const) {
    const maybeFile = fd.get(key);
    if (maybeFile && maybeFile instanceof File && maybeFile.size > 0) {
      storeInfo[key] = await uploadToImageKit(providerId, key, maybeFile);
    }
  }

  return storeInfo;
}

/** ---- API handlers ------------------------------------------------------ */

export async function PUT(req: NextRequest) {
  await connectToDatabase();

  const providerId = await getUserIdFromRequest(req);
  if (!providerId)
    return NextResponse.json({ message: "Provider Id Not Found." }, { status: 401, headers: corsHeaders });

  try {
    const storeInfo = await parseFormAndUpload(req, providerId);

    const provider = await Provider.findByIdAndUpdate(
      providerId,
      {
        storeInfo,
        storeInfoCompleted: true,
        registrationStatus: "store",
      },
      { new: true },
    );

    return NextResponse.json({ message: "Store info saved", provider },{ headers: corsHeaders });
  } catch (err: any) {
    console.error("store-info PUT error:", err);
    return NextResponse.json(
      { message: "Failed to save store info", error: err.message },
      { status: 500,headers: corsHeaders },
    );
  }
}

