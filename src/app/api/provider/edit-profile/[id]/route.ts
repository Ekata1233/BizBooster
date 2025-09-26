import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Provider from "@/models/Provider";
import { connectToDatabase } from "@/utils/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid provider ID" }, { status: 400 });
    }

    const form = await req.formData();
    const updateData: Record<string, any> = {};

    // 🔹 Extract text fields (including nested)
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

    // 🔹 Handle file uploads
    const fileKeys = [
      "logo",
      "cover",
      "galleryImages",
      "aadhaarCard",
      "panCard",
      "storeDocument",
      "GST",
      "other",
    ];

    for (const key of fileKeys) {
      const files = form.getAll(key) as File[];
      if (files && files.length > 0) {
        const uploadedUrls: string[] = [];
        for (const file of files) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const fileName = `${Date.now()}-${file.name}`;
          // Replace with your cloud upload logic
          uploadedUrls.push(`/uploads/${fileName}`);
        }

        if (["logo", "cover"].includes(key)) {
          updateData[`storeInfo.${key}`] = uploadedUrls[0]; // single file
        } else if (key === "galleryImages") {
          updateData.galleryImages = uploadedUrls; // merge later
        } else {
          if (!updateData.kyc) updateData.kyc = {};
          if (!updateData.kyc[key]) updateData.kyc[key] = [];
          updateData.kyc[key] = updateData.kyc[key].concat(uploadedUrls); // merge arrays
        }
      }
    }

    // ❌ Prevent forbidden updates
    const disallowed = ["_id", "providerId", "email", "phoneNo", "isDeleted"];
    disallowed.forEach((f) => delete updateData[f]);

    // Fetch provider
    const provider = await Provider.findById(id);
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    // 🔹 Merge arrays properly for galleryImages
    if (updateData.galleryImages) {
      provider.galleryImages = provider.galleryImages.concat(updateData.galleryImages);
      delete updateData.galleryImages;
    }

    // 🔹 Merge nested objects
    if (updateData.storeInfo) {
      provider.storeInfo = { ...provider.storeInfo?.toObject(), ...updateData.storeInfo };
      delete updateData.storeInfo;
    }
    if (updateData.kyc) {
      provider.kyc = { ...provider.kyc?.toObject(), ...updateData.kyc };
      delete updateData.kyc;
    }

    // 🔹 Merge remaining top-level fields
    provider.set(updateData);

    await provider.save();

    // Exclude password
    const providerResponse = provider.toObject();
    delete providerResponse.password;

    return NextResponse.json(
      { message: "Profile updated successfully", provider: providerResponse },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating provider:", error);
    return NextResponse.json(
      { error: "Failed to update provider", details: error.message },
      { status: 500 }
    );
  }
}
