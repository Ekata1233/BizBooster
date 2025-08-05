import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Offer from "@/models/Offer";
import imagekit from '@/utils/imagekit';
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/utils/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// export async function PUT(req: Request) {
//   await connectToDatabase();

//   const url = new URL(req.url);
//   const id = url.pathname.split("/").pop();

//   try {
//     if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { success: false, message: "Invalid Offer ID." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const body = await req.json().catch(() => null);
//     if (!body) {
//       return NextResponse.json(
//         { success: false, message: "Invalid JSON body." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const {
//       bannerImage,
//       thumbnailImage,
//       offerStartTime,
//       offerEndTime,
//       eligibilityCriteria,
//       howToParticipate,
//       faq,
//       termsAndConditions,
//     } = body;

//     const updated = await Offer.findByIdAndUpdate(
//       id,
//       {
//         bannerImage,
//         thumbnailImage,
//         offerStartTime,
//         offerEndTime,
//         eligibilityCriteria,
//         howToParticipate,
//         faq,
//         termsAndConditions,
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updated) {
//       return NextResponse.json(
//         { success: false, message: "Offer not found to update." },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       { success: true, data: updated },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: unknown) {
//     const message = error instanceof Error ? error.message : "Unknown error updating Offer.";
//     console.error("PUT Offer Error:", error);
//     return NextResponse.json(
//       { success: false, message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


export async function PUT(req: Request) {
    await connectToDatabase();

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    try {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid Offer ID." },
                { status: 400, headers: corsHeaders }
            );
        }

        const formData = await req.formData();
        
        const updateData: { [key: string]: string | File | undefined | null  } = {};

        const handleImageUpload = async (imageFile: File | null, folder: string, existingUrl?: string) => {
            if (imageFile && imageFile.size > 0) {
                const buffer = Buffer.from(await imageFile.arrayBuffer());
                const uploadResponse = await imagekit.upload({
                    file: buffer,
                    fileName: `${uuidv4()}-${imageFile.name}`,
                    folder,
                });
                return uploadResponse.url;
            }
            return existingUrl;
        };

        const existingOffer = await Offer.findById(id);
        if (!existingOffer) {
            return NextResponse.json(
                { success: false, message: "Offer not found to update." },
                { status: 404, headers: corsHeaders }
            );
        }

        const bannerImageFile = formData.get("bannerImage") as File | null;
        const thumbnailImageFile = formData.get("thumbnailImage") as File | null;

        const updatedBannerImageUrl = await handleImageUpload(bannerImageFile, "/offers/banners", existingOffer.bannerImage);
        if (updatedBannerImageUrl) {
            updateData.bannerImage = updatedBannerImageUrl;
        }

        const updatedThumbnailImageUrl = await handleImageUpload(thumbnailImageFile, "/offers/thumbnails", existingOffer.thumbnailImage);
        if (updatedThumbnailImageUrl) {
            updateData.thumbnailImage = updatedThumbnailImageUrl;
        }

        const fields = [
            'offerStartTime', 
            'offerEndTime', 
            'eligibilityCriteria', 
            'howToParticipate', 
            'faq', 
            'termsAndConditions'
        ];

        fields.forEach(field => {
            const value = formData.get(field);
            if (value && typeof value === 'string') {
                // Special handling for the 'faq' field
                if (field === 'faq') {
                    try {
                        // Parse the string into a JSON object
                        updateData[field] = JSON.parse(value);
                    } catch (e) {
                        console.error(`Failed to parse JSON for field: ${field}`, e);
                    }
                } else {
                    updateData[field] = value;
                }
            }
        });

        const updated = await Offer.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return NextResponse.json(
                { success: false, message: "Offer not found to update." },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { success: true, data: updated },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error updating Offer.";
        console.error("PUT Offer Error:", error);
        return NextResponse.json(
            { success: false, message },
            { status: 500, headers: corsHeaders }
        );
    }
}

export async function DELETE(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Offer ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deleted = await Offer.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Offer not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Offer deleted successfully.",
        data: { id },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error deleting Offer.";
    console.error("DELETE Offer Error:", error);
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}


export async function GET(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Offer ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const offer = await Offer.findById(id);
    if (!offer) {
      return NextResponse.json(
        { success: false, message: "Offer not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: offer },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error fetching Offer.";
    console.error("GET Offer Error:", error);
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}