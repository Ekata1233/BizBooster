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


// export async function PUT(req: Request) {
//     await connectToDatabase();

//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop();

//     try {
//         if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 { success: false, message: "Invalid Offer ID." },
//                 { status: 400, headers: corsHeaders }
//             );
//         }

//         const formData = await req.formData();
//         console.log("Received FormData:", formData);
        
//         const updateData: { [key: string]: string | File | undefined | null  } = {};

//         const handleImageUpload = async (imageFile: File | null, folder: string, existingUrl?: string) => {
//             if (imageFile && imageFile.size > 0) {
//                 const buffer = Buffer.from(await imageFile.arrayBuffer());
//                 const uploadResponse = await imagekit.upload({
//                     file: buffer,
//                     fileName: `${uuidv4()}-${imageFile.name}`,
//                     folder,
//                 });
//                 return uploadResponse.url;
//             }
//             return existingUrl;
//         };

//         const existingOffer = await Offer.findById(id);
//         if (!existingOffer) {
//             return NextResponse.json(
//                 { success: false, message: "Offer not found to update." },
//                 { status: 404, headers: corsHeaders }
//             );
//         }

//         const bannerImageFile = formData.get("bannerImage") as File | null;
//         const thumbnailImageFile = formData.get("thumbnailImage") as File | null;

//         const updatedBannerImageUrl = await handleImageUpload(bannerImageFile, "/offers/banners", existingOffer.bannerImage);
//         if (updatedBannerImageUrl) {
//             updateData.bannerImage = updatedBannerImageUrl;
//         }

//         const updatedThumbnailImageUrl = await handleImageUpload(thumbnailImageFile, "/offers/thumbnails", existingOffer.thumbnailImage);
//         if (updatedThumbnailImageUrl) {
//             updateData.thumbnailImage = updatedThumbnailImageUrl;
//         }

//         const fields = [
//             'offerStartTime', 
//             'offerEndTime', 
//             'eligibilityCriteria', 
//             'howToParticipate', 
//             'faq', 
//             'termsAndConditions'
//         ];

//         fields.forEach(field => {
//             const value = formData.get(field);
//             if (value && typeof value === 'string') {
//                 // Special handling for the 'faq' field
//                 if (field === 'faq') {
//                     try {
//                         // Parse the string into a JSON object
//                         updateData[field] = JSON.parse(value);
//                     } catch (e) {
//                         console.error(`Failed to parse JSON for field: ${field}`, e);
//                     }
//                 } else {
//                     updateData[field] = value;
//                 }
//             }
//         });

//         const updated = await Offer.findByIdAndUpdate(
//             id,
//             updateData,
//             { new: true, runValidators: true }
//         );

//         if (!updated) {
//             return NextResponse.json(
//                 { success: false, message: "Offer not found to update." },
//                 { status: 404, headers: corsHeaders }
//             );
//         }

//         return NextResponse.json(
//             { success: true, data: updated },
//             { status: 200, headers: corsHeaders }
//         );
//     } catch (error: unknown) {
//         const message = error instanceof Error ? error.message : "Unknown error updating Offer.";
//         console.error("PUT Offer Error:", error);
//         return NextResponse.json(
//             { success: false, message },
//             { status: 500, headers: corsHeaders }
//         );
//     }
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
        console.log("Received FormData entries:");
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value instanceof File ? `File (${value.name}, ${value.size} bytes)` : value);
        }
        
        const updateData: {
            service?: string;
            bannerImage?: string;
            thumbnailImage?: string;
            galleryImages?: string[];
            offerStartTime?: Date;
            offerEndTime?: Date;
            eligibilityCriteria?: string;
            howToParticipate?: string;
            faq?: Record<string, string>;
            termsAndConditions?: string;
            
        } = {};

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

        // Handle service field
        const serviceValue = formData.get("service");
        if (serviceValue && typeof serviceValue === "string") {
            updateData.service = serviceValue;
        }

        // Handle banner image
        const bannerImageFile = formData.get("bannerImage") as File | null;
        const updatedBannerImageUrl = await handleImageUpload(bannerImageFile, "/offers/banners", existingOffer.bannerImage);
        if (updatedBannerImageUrl) {
            updateData.bannerImage = updatedBannerImageUrl;
        }

        // Handle thumbnail image
        const thumbnailImageFile = formData.get("thumbnailImage") as File | null;
        const updatedThumbnailImageUrl = await handleImageUpload(thumbnailImageFile, "/offers/thumbnails", existingOffer.thumbnailImage);
        if (updatedThumbnailImageUrl) {
            updateData.thumbnailImage = updatedThumbnailImageUrl;
        }

        // Handle gallery images
        const galleryImages = formData.getAll("galleryImages") as File[];
        const updatedGalleryUrls: string[] = [];

        for (const imageFile of galleryImages) {
            if (imageFile && imageFile.size > 0) {
                const galleryUrl = await handleImageUpload(imageFile, "/offers/gallery", undefined);
                if (galleryUrl) {
                    updatedGalleryUrls.push(galleryUrl);
                }
            }
        }

        // If new gallery images were uploaded, replace the existing ones
        if (updatedGalleryUrls.length > 0) {
            updateData.galleryImages = updatedGalleryUrls;
        }

        // Handle text fields
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
                if (field === 'faq') {
                    try {
                        updateData[field] = JSON.parse(value);
                    } catch (e) {
                        console.error(`Failed to parse JSON for field: ${field}`, e);
                    }
                } else if (field === 'offerStartTime' || field === 'offerEndTime') {
                    // Handle date fields
                    updateData[field] = new Date(value);
                } else if (field === 'eligibilityCriteria' || field === 'howToParticipate' || field === 'termsAndConditions') {
                    updateData[field] = value;
                }
            }
        });

        console.log("Final update data:", updateData);

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