import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";

// ✅ Allowed origins
const allowedOrigins = [
  'http://localhost:3001',
  'https://biz-booster.vercel.app',
  'http://localhost:3000',
  'https://api.fetchtrue.com',
  'https://biz-booster-provider-panel.vercel.app',
];

function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Referrer-Policy": "no-referrer",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

// ─── CORS Pre-flight handler ───────────────────────────────
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

// ─── PUT Handler ───────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const origin = req.headers.get("origin");

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid provider ID" },
        { status: 400, headers: getCorsHeaders(origin) }
      );
    }

    const form = await req.formData();
    const updateData: Record<string, any> = {};

    // Extract text fields including nested
    form.forEach((value, key) => {
      if (typeof value === "string") {
        if (key.includes(".")) {
          const parts = key.split(".");
          let ref = updateData;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!ref[parts[i]]) ref[parts[i]] = {};
            ref = ref[parts[i]];
          }
          ref[parts[parts.length - 1]] = value;
        } else {
          updateData[key] = value;
        }
      }
    });

    // Handle file uploads
    const fileKeys = [
      "logo", "cover", "galleryImages",
      "aadhaarCard", "panCard", "storeDocument", "GST", "other",
    ];

    for (const key of fileKeys) {
      const files = form.getAll(key) as File[];
      if (files.length > 0) {
        const uploadedUrls: string[] = [];
        for (const file of files) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const fileName = `${Date.now()}-${file.name}`;
          // Replace with your cloud upload logic
          uploadedUrls.push(`/uploads/${fileName}`);
        }

        if (["logo", "cover"].includes(key)) {
          updateData[`storeInfo.${key}`] = uploadedUrls[0];
        } else if (key === "galleryImages") {
          updateData.galleryImages = uploadedUrls;
        } else {
          if (!updateData.kyc) updateData.kyc = {};
          if (!updateData.kyc[key]) updateData.kyc[key] = [];
          updateData.kyc[key] = updateData.kyc[key].concat(uploadedUrls);
        }
      }
    }

    // Prevent forbidden updates
    const disallowed = ["_id", "providerId", "email", "phoneNo", "isDeleted"];
    disallowed.forEach((f) => delete updateData[f]);

    // Fetch provider
    const provider = await Provider.findById(id);
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404, headers: getCorsHeaders(origin) }
      );
    }

    // Merge arrays and nested objects
    if (updateData.galleryImages) {
      provider.galleryImages = provider.galleryImages.concat(updateData.galleryImages);
      delete updateData.galleryImages;
    }
    if (updateData.storeInfo) {
      provider.storeInfo = { ...provider.storeInfo?.toObject(), ...updateData.storeInfo };
      delete updateData.storeInfo;
    }
    if (updateData.kyc) {
      provider.kyc = { ...provider.kyc?.toObject(), ...updateData.kyc };
      delete updateData.kyc;
    }

    provider.set(updateData);
    await provider.save();

    const providerResponse = provider.toObject();
    delete providerResponse.password;

    return NextResponse.json(
      { message: "Profile updated successfully", provider: providerResponse },
      { status: 200, headers: getCorsHeaders(origin) }
    );
  } catch (error: any) {
    console.error("Error updating provider:", error);
    const origin = req.headers.get("origin");
    return NextResponse.json(
      { error: "Failed to update provider", details: error.message },
      { status: 500, headers: getCorsHeaders(origin) }
    );
  }
}
