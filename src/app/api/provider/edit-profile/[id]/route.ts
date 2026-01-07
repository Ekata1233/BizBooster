import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ───────────── PUT: Update Provider ─────────────
export async function PATCH(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing provider ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await req.formData();
    const updateData: Record<string, any> = {};


    // ✅ Handle storeInfo.tags as full array (REPLACE strategy)
const incomingTags = formData.getAll("storeInfo.tags");

if (incomingTags.length > 0) {
  updateData.storeInfo = updateData.storeInfo || {};
  updateData.storeInfo.tags = incomingTags;
}


    formData.forEach((value, key) => {
  if (typeof value === "string") {

    // 🔥 Skip tags here (handled separately as array)
    if (key === "storeInfo.tags") return;

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


    // ── File upload keys
    const fileKeys = ["logo", "cover", "galleryImages", "aadhaarCard", "panCard", "storeDocument", "GST", "other"];

    for (const key of fileKeys) {
      const files = formData.getAll(key) as File[];
      if (files && files.length > 0) {
        const uploadedUrls: string[] = [];
       for (const file of files) {
  if (file && typeof file === "object" && "arrayBuffer" in file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: `${uuidv4()}`,
      folder:
        key === "galleryImages" || key === "logo" || key === "cover"
          ? "/provider"
          : "/provider/kyc",
    });
    uploadedUrls.push(uploadResponse.url);
  }
}


        if (["logo", "cover"].includes(key)) {
          updateData[`storeInfo.${key}`] = uploadedUrls[0];
        } else if (key === "galleryImages") {
          updateData.galleryImages = uploadedUrls;
        } else {
          if (!updateData.kyc) updateData.kyc = {};
          updateData.kyc[key] = uploadedUrls;
        }
      }
    }

    // ── Prevent forbidden updates
    const disallowed = ["_id", "providerId", "isDeleted"];
    disallowed.forEach(f => delete updateData[f]);

    // ── Find provider
    const provider = await Provider.findById(id);
    if (!provider) {
      return NextResponse.json({ success: false, message: "Provider not found." }, { status: 404, headers: corsHeaders });
    }

    // ── Merge arrays and nested objects
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

    return NextResponse.json({ success: true, message: "Profile updated successfully", data: providerResponse }, { status: 200, headers: corsHeaders });
  } catch (error: unknown) {

  // ✅ Handle MongoDB duplicate key error
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as any).code === 11000
  ) {
    const key = Object.keys((error as any).keyValue || {})[0];

    return NextResponse.json(
      {
        success: false,
        message: `${key} already exists`
      },
      { status: 409, headers: corsHeaders }
    );
  }

  // ✅ Handle validation errors
  if (error instanceof mongoose.Error.ValidationError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message
      },
      { status: 400, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: "Something went wrong while updating provider"
    },
    { status: 500, headers: corsHeaders }
  );
}
}

// ───────────── GET: Fetch Provider ─────────────
export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid or missing provider ID." }, { status: 400, headers: corsHeaders });
    }

    const provider = await Provider.findById(id);
    if (!provider) return NextResponse.json({ success: false, message: "Provider not found." }, { status: 404, headers: corsHeaders });

    const providerResponse = provider.toObject();
    delete providerResponse.password;

    return NextResponse.json({ success: true, data: providerResponse }, { status: 200, headers: corsHeaders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
  }
}
