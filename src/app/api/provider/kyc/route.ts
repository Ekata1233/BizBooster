/**
 * src/app/api/provider/kyc/route.ts
 *
 * Handles:
 *   PUT      – save / update provider KYC docs (files + any text)
 *   OPTIONS  – CORS pre-flight
 *
 * Runtime: Node (so we can use Buffer)
 */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { getUserIdFromRequest } from "@/utils/auth";
import Provider from "@/models/Provider";
import imagekit from "@/utils/imagekit";
import { v4 as uuid } from "uuid";

export const runtime = "nodejs";

/* ------------------------------------------------------------------------ */
/* Helpers                                                                  */
/* ------------------------------------------------------------------------ */
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

/** Upload a File to ImageKit, return its public URL */
async function uploadFile(
  providerId: string,
  key: string,
  file: File,
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.type.split("/")[1] || "bin";
  const fileName = `${key}-${uuid()}.${ext}`;

  const res = await imagekit.upload({
    file: buffer,
    fileName,
    folder: `/providers/${providerId}/kyc`,
    useUniqueFileName: false,
  });

  return res.url;
}

/** Parse multipart/form-data; upload all files; return populated `kyc` object */
async function parseKycForm(
  req: NextRequest,
  providerId: string,
): Promise<Record<string, any>> {
  const fd = await req.formData();
  const kyc: Record<string, any> = {};

  // Handle text fields
  for (const [key, value] of fd.entries()) {
    if (typeof value === "object" && "arrayBuffer" in value) continue;

    try {
      kyc[key] = JSON.parse(value as string);
    } catch {
      kyc[key] = value;
    }
  }

  // Handle files (max 2 per field)
  for (const [key, value] of fd.entries()) {
    if (
      typeof value !== "object" ||
      !("arrayBuffer" in value) ||
      value.size === 0
    ) {
      continue;
    }

    const file = value as File;
    const url = await uploadFile(providerId, key, file);

    if (!kyc[key]) {
      kyc[key] = [url];
    } else if (Array.isArray(kyc[key])) {
      if (kyc[key].length < 2) {
        kyc[key].push(url);
      }
    } else {
      kyc[key] = [kyc[key], url].slice(0, 2);
    }
  }

  return kyc;
}



/* ------------------------------------------------------------------------ */
/* API handlers                                                             */
/* ------------------------------------------------------------------------ */

export async function PUT(req: NextRequest) {
  await connectToDatabase();

  const providerId = await getUserIdFromRequest(req);
  if (!providerId)
    return NextResponse.json({ message: "Unauthenticated" }, { status: 401, headers: corsHeaders });

  try {
    const kyc = await parseKycForm(req, providerId);

    console.log("Kyc data : ", kyc);
    console.log("providerId info : ", providerId)


    const provider = await Provider.findByIdAndUpdate(
      providerId,
      {
        kyc,
        kycCompleted: true,
        registrationStatus: "done",
      },
      { new: true },
    );

    return NextResponse.json({ message: "KYC saved", provider }, { headers: corsHeaders });
  } catch (err: any) {
    console.error("KYC PUT error:", err);
    return NextResponse.json(
      { message: "Failed to save KYC", error: err.message },
      { status: 500, headers: corsHeaders },
    );
  }
}


