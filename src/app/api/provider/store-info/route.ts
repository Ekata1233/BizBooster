import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { getUserIdFromRequest } from "@/utils/auth";
import Provider from "@/models/Provider";
import imagekit from "@/utils/imagekit";
import { v4 as uuid } from "uuid";
import '@/models/Zone'
import '@/models/Module'
import { File, Blob } from "buffer";

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
    useUniqueFileName: false,      
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
    if (value instanceof Blob) continue; // Node-safe check
     if (key === "tags") {
      // handle tags safely
      if (typeof value === "string") {
        try {
          storeInfo.tags = JSON.parse(value); // ["a","b"]
        } catch {
          storeInfo.tags = value.split(",").map(v => v.trim());
        }
      }
      continue;
    }

    if (key === "totalProjects" || key === "totalExperience") {
      storeInfo[key] = Number(value);
      continue;
    }

    try {
      storeInfo[key] = JSON.parse(value as string); // allow JSON strings
    } catch {
      storeInfo[key] = value; // plain string
    }
  }

  if (storeInfo.moduleId) {
    storeInfo.module = storeInfo.moduleId;
    delete storeInfo.moduleId;
  }
  if (storeInfo.zoneId) {
    storeInfo.zone = storeInfo.zoneId;
    delete storeInfo.zoneId;
  }

  // Handle logo / cover files
  for (const key of ["logo", "cover"] as const) {
    const maybeFile = fd.get(key); // <-- define it here
    if (maybeFile && maybeFile instanceof Blob && maybeFile.size > 0) {
      storeInfo[key] = await uploadToImageKit(providerId, key, maybeFile as any);
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

    console.log("store info : ", storeInfo)
        console.log("providerId info : ", providerId)


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

