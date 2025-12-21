import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import "@/models/Category";
import "@/models/Subcategory";
import "@/models/Provider";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function extractId(req: Request | NextRequest) {
  const url = new URL(req.url);
  return url.pathname.split("/").pop();
}

/* =============================
   GET SERVICE BY ID
============================= */
export async function GET(req: Request) {
  await connectToDatabase();
  try {
    const id = extractId(req);
    if (!id) return NextResponse.json({ success: false, message: "ID missing" }, { status: 400, headers: corsHeaders });

    const service = await Service.findById(id)
      .populate("category")
      .populate("subcategory")
      .populate({
        path: "providerPrices.provider",
        model: "Provider",
        select: "fullName storeInfo.storeName storeInfo.logo",
      });

    if (!service) return NextResponse.json({ success: false, message: "Service not found" }, { status: 404, headers: corsHeaders });

    return NextResponse.json({ success: true, data: service }, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: corsHeaders });
  }
}

/* =============================
   UPDATE SERVICE BY ID
   Supports FormData + ImageKit
============================= */
// export async function PUT(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const url = new URL(req.url);
//     const id = url.pathname.split("/").pop();

//     console.log("Service ID for update:", id);

//     if (!id) {
//       return NextResponse.json({ success: false, message: "Service ID is required" }, { status: 400, headers: corsHeaders });
//     }

//     // Check if service exists
//     const existingService = await Service.findById(id);
//     if (!existingService) {
//       return NextResponse.json({ success: false, message: "Service not found" }, { status: 404, headers: corsHeaders });
//     }

//     const formData = await req.formData();
//     console.log("------------- Update formdata:", formData);

//     // --- Basic Fields ---
//     const serviceName = (formData.get("serviceName") as string)?.trim();
//     const category = (formData.get("category") as string)?.trim();
//     const subcategory = (formData.get("subcategory") as string)?.trim() || null;
//     const price = Number(formData.get("price") || existingService.price);
//     const discount = Number(formData.get("discount") || existingService.discount);
//     const gst = Number(formData.get("gst") || existingService.gst);
//     const includeGst = formData.get("includeGst") ? formData.get("includeGst") === "true" : existingService.includeGst;
//     const recommendedServices = formData.get("recommendedServices") ? formData.get("recommendedServices") === "true" : existingService.recommendedServices;

//     // Validate required fields
//     if (!serviceName) return NextResponse.json({ success: false, message: "Service name is required" }, { status: 400, headers: corsHeaders });
//     if (!category) return NextResponse.json({ success: false, message: "Category is required" }, { status: 400, headers: corsHeaders });

//     // --- Tags ---
//     const tags: string[] = [];
//     const tagsUpdated = formData.has("tags[0]"); // Check if tags are being updated
//     if (tagsUpdated) {
//       for (const key of formData.keys()) {
//         if (key.startsWith("tags[")) {
//           const val = formData.get(key) as string;
//           if (val) tags.push(val);
//         }
//       }
//     } else {
//       tags.push(...existingService.tags || []);
//     }

//     // --- Key Values ---
//     const keyValues: any[] = [];
//     const keyValuesUpdated = formData.has("keyValues[0][key]");
//     if (keyValuesUpdated) {
//       for (let i = 0; i < 10; i++) {
//         const key = formData.get(`keyValues[${i}][key]`);
//         const value = formData.get(`keyValues[${i}][value]`);
//         if (!key || !value) break;
//         keyValues.push({ key, value });
//       }
//     } else {
//       keyValues.push(...existingService.keyValues || []);
//     }

//     // --- Helper: Upload File ---
//     async function handleFileUpload(file: File, folder: string) {
//       const buffer = Buffer.from(await file.arrayBuffer());
//       const upload = await imagekit.upload({
//         file: buffer,
//         fileName: `${uuidv4()}-${file.name}`,
//         folder,
//       });
//       return upload.url;
//     }

//     // --- Thumbnail ---
//     let thumbnailImage = existingService.thumbnailImage || "";
//     const thumbnailFile = formData.get("thumbnail") as File | null;
//     if (thumbnailFile instanceof File) {
//       const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
//       const upload = await imagekit.upload({
//         file: buffer,
//         fileName: `${uuidv4()}-${thumbnailFile.name}`,
//         folder: "/services/thumbnail",
//       });
//       thumbnailImage = upload.url;
//     }

//     // --- Banner Images ---
//     let bannerImages: string[] = existingService.bannerImages || [];
//     const bannerImagesUpdated = Array.from(formData.keys()).some(key => key.startsWith("bannerImages"));
    
//     if (bannerImagesUpdated) {
//       bannerImages = [];
//       for (const key of formData.keys()) {
//         if (key.startsWith("bannerImages")) {
//           const file = formData.get(key);
//           if (file instanceof File) {
//             const buffer = Buffer.from(await file.arrayBuffer());
//             const upload = await imagekit.upload({
//               file: buffer,
//               fileName: `${uuidv4()}-${file.name}`,
//               folder: "/services/banners",
//             });
//             bannerImages.push(upload.url);
//           }
//         }
//       }
//     }

//     // --- Provider Prices ---
//     const providerPrices: any[] = [];
//     const providerPricesUpdated = formData.has("providerPrices[0][provider]");
//     if (providerPricesUpdated) {
//       for (let i = 0; i < 10; i++) {
//         const provider = formData.get(`providerPrices[${i}][provider]`);
//         if (!provider) break;
//         providerPrices.push({
//           provider,
//           providerMRP: formData.get(`providerPrices[${i}][providerMRP]`),
//           providerDiscount: formData.get(`providerPrices[${i}][providerDiscount]`),
//           providerPrice: formData.get(`providerPrices[${i}][providerPrice]`),
//           providerCommission: formData.get(`providerPrices[${i}][providerCommission]`),
//           status: formData.get(`providerPrices[${i}][status]`),
//         });
//       }
//     } else {
//       providerPrices.push(...existingService.providerPrices || []);
//     }

//     // --- Service Details ---
//     const serviceDetails: any = {
//       benefits: formData.has("benefits") ? JSON.parse(formData.get("benefits") as string || "[]") : existingService.serviceDetails?.benefits || [],
//       aboutUs: formData.has("aboutUs") ? JSON.parse(formData.get("aboutUs") as string || "[]") : existingService.serviceDetails?.aboutUs || [],
//       document: formData.has("document") ? JSON.parse(formData.get("document") as string || "[]") : existingService.serviceDetails?.document || [],
//       termsAndConditions: formData.has("termsAndConditions") ? JSON.parse(formData.get("termsAndConditions") as string || "[]") : existingService.serviceDetails?.termsAndConditions || [],
//       highlight: existingService.serviceDetails?.highlight || [],
//       assuredByFetchTrue: existingService.serviceDetails?.assuredByFetchTrue || [],
//       howItWorks: existingService.serviceDetails?.howItWorks || [],
//       whyChooseUs: existingService.serviceDetails?.whyChooseUs || [],
//       weRequired: existingService.serviceDetails?.weRequired || [],
//       weDeliver: existingService.serviceDetails?.weDeliver || [],
//       moreInfo: existingService.serviceDetails?.moreInfo || [],
//       connectWith: existingService.serviceDetails?.connectWith || [],
//       timeRequired: existingService.serviceDetails?.timeRequired || [],
//       faq: existingService.serviceDetails?.faq || [],
//       packages: existingService.serviceDetails?.packages || [],
//       extraSections: existingService.serviceDetails?.extraSections || [],
//       extraImages: existingService.serviceDetails?.extraImages || [],
//     };

//     // --- Highlights ---
//     const highlightUpdated = Array.from(formData.keys()).some(key => key.startsWith("serviceDetails[highlight]"));
//     if (highlightUpdated) {
//       serviceDetails.highlight = [];
//       for (const key of formData.keys()) {
//         if (key.startsWith("serviceDetails[highlight]")) {
//           const file = formData.get(key);
//           if (file instanceof File) {
//             serviceDetails.highlight.push(await handleFileUpload(file, "/services/highlight"));
//           }
//         }
//       }
//     }

//     // --- Sections with icon/image ---
//     async function processSection(field: string, folder: string, mediaKey: "icon" | "image", existingData: any[]) {
//       const arr: any[] = [];
//       const sectionUpdated = formData.has(`serviceDetails[${field}][0][title]`);
      
//       if (!sectionUpdated) return existingData;

//       for (let i = 0; i < 10; i++) {
//         const title = formData.get(`serviceDetails[${field}][${i}][title]`);
//         if (!title) break;
//         const description = formData.get(`serviceDetails[${field}][${i}][description]`);
//         const mediaFile = formData.get(`serviceDetails[${field}][${i}][${mediaKey}]`);
//         let url = "";
//         if (mediaFile instanceof File) {
//           url = await handleFileUpload(mediaFile, folder);
//         } else if (existingData[i] && existingData[i][mediaKey]) {
//           url = existingData[i][mediaKey];
//         }
//         arr.push({ title, description, [mediaKey]: url });
//       }
//       return arr;
//     }

//     serviceDetails.assuredByFetchTrue = await processSection(
//       "assuredByFetchTrue",
//       "/services/assuredIcons",
//       "icon",
//       existingService.serviceDetails?.assuredByFetchTrue || []
//     );

//     serviceDetails.howItWorks = await processSection(
//       "howItWorks",
//       "/services/howItWorks",
//       "icon",
//       existingService.serviceDetails?.howItWorks || []
//     );

//     serviceDetails.whyChooseUs = await processSection(
//       "whyChooseUs",
//       "/services/whyChooseUs",
//       "icon",
//       existingService.serviceDetails?.whyChooseUs || []
//     );

//     serviceDetails.weRequired = await processSection(
//       "weRequired",
//       "/services/weRequired",
//       "icon",
//       existingService.serviceDetails?.weRequired || []
//     );

//     serviceDetails.weDeliver = await processSection(
//       "weDeliver",
//       "/services/weDeliver",
//       "icon",
//       existingService.serviceDetails?.weDeliver || []
//     );

//     serviceDetails.moreInfo = await processSection(
//       "moreInfo",
//       "/services/moreInfo",
//       "image",
//       existingService.serviceDetails?.moreInfo || []
//     );

//     // --- Connect With ---
//     const connectWithUpdated = formData.has("serviceDetails[connectWith][0][name]");
//     if (connectWithUpdated) {
//       serviceDetails.connectWith = [];
//       for (let i = 0; i < 10; i++) {
//         const name = formData.get(`serviceDetails[connectWith][${i}][name]`);
//         if (!name) break;
//         serviceDetails.connectWith.push({
//           name,
//           mobileNo: formData.get(`serviceDetails[connectWith][${i}][mobileNo]`),
//           email: formData.get(`serviceDetails[connectWith][${i}][email]`),
//         });
//       }
//     }

//     // --- Time Required ---
//     const timeRequiredUpdated = formData.has("serviceDetails[timeRequired][0][minDays]");
//     if (timeRequiredUpdated) {
//       serviceDetails.timeRequired = [];
//       for (let i = 0; i < 10; i++) {
//         const minDays = formData.get(`serviceDetails[timeRequired][${i}][minDays]`);
//         if (!minDays) break;
//         serviceDetails.timeRequired.push({
//           minDays,
//           maxDays: formData.get(`serviceDetails[timeRequired][${i}][maxDays]`),
//         });
//       }
//     }

//     // --- FAQ ---
//     const faqUpdated = formData.has("serviceDetails[faq][0][question]");
//     if (faqUpdated) {
//       serviceDetails.faq = [];
//       for (let i = 0; i < 10; i++) {
//         const question = formData.get(`serviceDetails[faq][${i}][question]`);
//         if (!question) break;
//         const answer = formData.get(`serviceDetails[faq][${i}][answer]`);
//         serviceDetails.faq.push({ question, answer });
//       }
//     }

//     // --- Packages ---
//     const packagesUpdated = formData.has("serviceDetails[packages][0][name]");
//     if (packagesUpdated) {
//       serviceDetails.packages = [];
//       for (let i = 0; i < 10; i++) {
//         const name = formData.get(`serviceDetails[packages][${i}][name]`);
//         if (!name) break;
//         const pkg: any = {
//           name,
//           price: formData.get(`serviceDetails[packages][${i}][price]`),
//           discount: formData.get(`serviceDetails[packages][${i}][discount]`),
//           discountedPrice: formData.get(`serviceDetails[packages][${i}][discountedPrice]`),
//           whatYouGet: [],
//         };
//         for (let j = 0; j < 10; j++) {
//           const item = formData.get(`serviceDetails[packages][${i}][whatYouGet][${j}]`);
//           if (!item) break;
//           pkg.whatYouGet.push(item);
//         }
//         serviceDetails.packages.push(pkg);
//       }
//     }

//     // --- Extra Images ---
//     const extraImagesUpdated = Array.from(formData.keys()).some(key => key.startsWith("serviceDetails[extraImages]"));
//     if (extraImagesUpdated) {
//       serviceDetails.extraImages = [];
//       for (const key of formData.keys()) {
//         if (key.startsWith("serviceDetails[extraImages]")) {
//           const file = formData.get(key);
//           if (file instanceof File) {
//             const buffer = Buffer.from(await file.arrayBuffer());
//             const upload = await imagekit.upload({
//               file: buffer,
//               fileName: `${uuidv4()}-${file.name}`,
//               folder: "/services/extraImages",
//             });
//             serviceDetails.extraImages.push(upload.url);
//           }
//         }
//       }
//     }

//     // --- Extra Sections ---
//     const extraSectionsUpdated = formData.has("serviceDetails[extraSections][0][title]");
//     if (extraSectionsUpdated) {
//       serviceDetails.extraSections = [];
//       for (let i = 0; i < 10; i++) {
//         const title = formData.get(`serviceDetails[extraSections][${i}][title]`);
//         if (!title) break;

//         const extraSection: any = {
//           title,
//           subtitle: [],
//           description: [],
//           subDescription: [],
//           lists: [],
//           tags: [],
//           image: [],
//         };

//         for (let j = 0; j < 10; j++) {
//           const subtitle = formData.get(`serviceDetails[extraSections][${i}][subtitle][${j}]`);
//           if (!subtitle) break;
//           extraSection.subtitle.push(subtitle);
//         }

//         for (let j = 0; j < 10; j++) {
//           const description = formData.get(`serviceDetails[extraSections][${i}][description][${j}]`);
//           if (!description) break;
//           extraSection.description.push(description);
//         }

//         for (let j = 0; j < 10; j++) {
//           const subDescription = formData.get(`serviceDetails[extraSections][${i}][subDescription][${j}]`);
//           if (!subDescription) break;
//           extraSection.subDescription.push(subDescription);
//         }

//         for (let j = 0; j < 10; j++) {
//           const list = formData.get(`serviceDetails[extraSections][${i}][lists][${j}]`);
//           if (!list) break;
//           extraSection.lists.push(list);
//         }

//         for (let j = 0; j < 10; j++) {
//           const tag = formData.get(`serviceDetails[extraSections][${i}][tags][${j}]`);
//           if (!tag) break;
//           extraSection.tags.push(tag);
//         }

//         for (let j = 0; j < 10; j++) {
//           const imageFile = formData.get(`serviceDetails[extraSections][${i}][image][${j}]`);
//           if (imageFile instanceof File) {
//             const buffer = Buffer.from(await imageFile.arrayBuffer());
//             const upload = await imagekit.upload({
//               file: buffer,
//               fileName: `${uuidv4()}-${imageFile.name}`,
//               folder: "/services/extraSections",
//             });
//             extraSection.image.push(upload.url);
//           } else {
//             break;
//           }
//         }

//         serviceDetails.extraSections.push(extraSection);
//       }
//     }

//     // --- Franchise Details ---
//     const franchiseDetails: any = {
//       commission: formData.has("franchiseDetails[commission]") ? formData.get("franchiseDetails[commission]") : existingService.franchiseDetails?.commission,
//       termsAndConditions: formData.has("franchiseDetails[termsAndConditions]") ? formData.get("franchiseDetails[termsAndConditions]") : existingService.franchiseDetails?.termsAndConditions,
//       investmentRange: existingService.franchiseDetails?.investmentRange || [],
//       monthlyEarnPotential: existingService.franchiseDetails?.monthlyEarnPotential || [],
//       franchiseModel: existingService.franchiseDetails?.franchiseModel || [],
//       extraSections: existingService.franchiseDetails?.extraSections || [],
//       extraImages: existingService.franchiseDetails?.extraImages || [],
//     };

//     // --- Investment Range ---
//     const investmentRangeUpdated = formData.has("franchiseDetails[investmentRange][0][minRange]");
//     if (investmentRangeUpdated) {
//       franchiseDetails.investmentRange = [];
//       for (let i = 0; i < 10; i++) {
//         const min = formData.get(`franchiseDetails[investmentRange][${i}][minRange]`);
//         const max = formData.get(`franchiseDetails[investmentRange][${i}][maxRange]`);
//         if (!min) break;
//         franchiseDetails.investmentRange.push({ minRange: min, maxRange: max });
//       }
//     }

//     // --- Monthly Earn Potential ---
//     const monthlyEarnUpdated = formData.has("franchiseDetails[monthlyEarnPotential][0][minEarn]");
//     if (monthlyEarnUpdated) {
//       franchiseDetails.monthlyEarnPotential = [];
//       for (let i = 0; i < 10; i++) {
//         const min = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][minEarn]`);
//         const max = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][maxEarn]`);
//         if (!min) break;
//         franchiseDetails.monthlyEarnPotential.push({ minEarn: min, maxEarn: max });
//       }
//     }

//     // --- Franchise Model ---
//     const franchiseDetails: any = {
//       commission: formData.has("franchiseDetails[commission]") ? formData.get("franchiseDetails[commission]") : existingService.franchiseDetails?.commission,
//       termsAndConditions: formData.has("franchiseDetails[termsAndConditions]") ? formData.get("franchiseDetails[termsAndConditions]") : existingService.franchiseDetails?.termsAndConditions,
//       investmentRange: existingService.franchiseDetails?.investmentRange || [],
//       monthlyEarnPotential: existingService.franchiseDetails?.monthlyEarnPotential || [],
//       franchiseModel: existingService.franchiseDetails?.franchiseModel || [],
//       extraSections: existingService.franchiseDetails?.extraSections || [],
//       extraImages: existingService.franchiseDetails?.extraImages || [],
//     };

//     // --- Investment Range ---
//     const investmentRangeUpdated = formData.has("franchiseDetails[investmentRange][0][minRange]");
//     if (investmentRangeUpdated) {
//       franchiseDetails.investmentRange = [];
//       for (let i = 0; i < 10; i++) {
//         const min = formData.get(`franchiseDetails[investmentRange][${i}][minRange]`);
//         const max = formData.get(`franchiseDetails[investmentRange][${i}][maxRange]`);
//         if (!min) break;
//         franchiseDetails.investmentRange.push({ minRange: min, maxRange: max });
//       }
//     }

//     // --- Monthly Earn Potential ---
//     const monthlyEarnUpdated = formData.has("franchiseDetails[monthlyEarnPotential][0][minEarn]");
//     if (monthlyEarnUpdated) {
//       franchiseDetails.monthlyEarnPotential = [];
//       for (let i = 0; i < 10; i++) {
//         const min = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][minEarn]`);
//         const max = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][maxEarn]`);
//         if (!min) break;
//         franchiseDetails.monthlyEarnPotential.push({ minEarn: min, maxEarn: max });
//       }
//     }

//     // --- Franchise Model ---
//     const franchiseModelUpdated = formData.has("franchiseDetails[franchiseModel][0][title]");
//     if (franchiseModelUpdated) {
//       franchiseDetails.franchiseModel = [];
//       for (let i = 0; i < 10; i++) {
//         const title = formData.get(`franchiseDetails[franchiseModel][${i}][title]`);
//         if (!title) break;
//         franchiseDetails.franchiseModel.push({
//           title,
//           agreement: formData.get(`franchiseDetails[franchiseModel][${i}][agreement]`),
//           price: formData.get(`franchiseDetails[franchiseModel][${i}][price]`),
//           discount: formData.get(`franchiseDetails[franchiseModel][${i}][discount]`),
//           gst: formData.get(`franchiseDetails[franchiseModel][${i}][gst]`),
//           fees: formData.get(`franchiseDetails[franchiseModel][${i}][fees]`),
//         });
//       }
//     }
//     // --- Final Price Calculations ---
//     const discountedPrice = discount ? Math.floor(price - price * (discount / 100)) : price;
//     const gstInRupees = (discountedPrice * gst) / 100;
//     const totalWithGst = discountedPrice + gstInRupees;

//     // --- Update Service ---
//     const updatedService = await Service.findByIdAndUpdate(
//       id,
//       {
//         serviceName,
//         category,
//         subcategory,
//         price,
//         discount,
//         gst,
//         includeGst,
//         discountedPrice,
//         gstInRupees,
//         totalWithGst,
//         thumbnailImage,
//         bannerImages,
//         providerPrices,
//         tags,
//         keyValues,
//         serviceDetails,
//         franchiseDetails,
//         recommendedServices,
//       },
//       { new: true, runValidators: true }
//     );

//     return NextResponse.json({ success: true, data: updatedService }, { status: 200, headers: corsHeaders });
//   } catch (err: any) {
//     console.error("🔥 UPDATE API ERROR:", err);
//     return NextResponse.json({ success: false, message: err.message }, { status: 500, headers: corsHeaders });
//   }
// }


export async function PUT(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    console.log("Service ID for update:", id);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Service ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if service exists
    const existingService = await Service.findById(id);
    if (!existingService) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const formData = await req.formData();
    console.log("------------- Update formdata:", formData);

    // --- Basic Fields ---
    const serviceName = (formData.get("serviceName") as string)?.trim();
    const category = (formData.get("category") as string)?.trim();
    const subcategory = (formData.get("subcategory") as string)?.trim() || null;
    const price = Number(formData.get("price") || existingService.price);
    const discount = Number(formData.get("discount") || existingService.discount);
    const gst = Number(formData.get("gst") || existingService.gst);
    const includeGst = formData.get("includeGst")
      ? formData.get("includeGst") === "true"
      : existingService.includeGst;
    const recommendedServices = formData.get("recommendedServices")
      ? formData.get("recommendedServices") === "true"
      : existingService.recommendedServices;

    // Validate required fields
    if (!serviceName) {
      return NextResponse.json(
        { success: false, message: "Service name is required" },
        { status: 400, headers: corsHeaders }
      );
    }
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // --- Tags ---
    const tags: string[] = [];
    const tagsUpdated = formData.has("tags[0]");
    if (tagsUpdated) {
      for (const key of formData.keys()) {
        if (key.startsWith("tags[")) {
          const val = formData.get(key) as string;
          if (val) tags.push(val.trim());
        }
      }
    } else {
      tags.push(...(existingService.tags || []));
    }

    // --- Key Values ---
    const keyValues: { key: string; value: string }[] = [];
    const keyValuesUpdated = formData.has("keyValues[0][key]");
    if (keyValuesUpdated) {
      for (let i = 0; i < 10; i++) {
        const key = formData.get(`keyValues[${i}][key]`) as string;
        const value = formData.get(`keyValues[${i}][value]`) as string;
        if (!key || !value) break;
        keyValues.push({ key: key.trim(), value: value.trim() });
      }
    } else {
      keyValues.push(...(existingService.keyValues || []));
    }

    // --- Helper: Upload File ---
    async function handleFileUpload(file: File, folder: string): Promise<string> {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Optional: Validate file type and size
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (buffer.length > maxSize) {
          throw new Error(`File size too large. Maximum size is 5MB.`);
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        }

        const upload = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${file.name}`,
          folder,
        });
        return upload.url;
      } catch (error) {
        console.error("File upload error:", error);
        throw error;
      }
    }

    // --- Thumbnail ---
    let thumbnailImage = existingService.thumbnailImage || "";
    const thumbnailFile = formData.get("thumbnail") as File | null;
    if (thumbnailFile && thumbnailFile instanceof File && thumbnailFile.size > 0) {
      thumbnailImage = await handleFileUpload(thumbnailFile, "/services/thumbnail");
    }

    // --- Banner Images ---
    let bannerImages: string[] = existingService.bannerImages || [];
    const bannerImagesUpdated = Array.from(formData.keys()).some((key) =>
      key.startsWith("bannerImages")
    );

    if (bannerImagesUpdated) {
      bannerImages = [];
      for (const key of formData.keys()) {
        if (key.startsWith("bannerImages")) {
          const file = formData.get(key);
          if (file instanceof File && file.size > 0) {
            const url = await handleFileUpload(file, "/services/banners");
            bannerImages.push(url);
          }
        }
      }
    }

    // --- Provider Prices ---
    const providerPrices: any[] = [];
    const providerPricesUpdated = formData.has("providerPrices[0][provider]");
    if (providerPricesUpdated) {
      for (let i = 0; i < 10; i++) {
        const provider = formData.get(`providerPrices[${i}][provider]`) as string;
        if (!provider) break;
        
        const providerMRP = formData.get(`providerPrices[${i}][providerMRP]`) as string;
        const providerDiscount = formData.get(`providerPrices[${i}][providerDiscount]`) as string;
        const providerPrice = formData.get(`providerPrices[${i}][providerPrice]`) as string;
        const providerCommission = formData.get(`providerPrices[${i}][providerCommission]`) as string;
        const status = formData.get(`providerPrices[${i}][status]`) as string;

        providerPrices.push({
          provider: provider.trim(),
          providerMRP: providerMRP ? Number(providerMRP) : 0,
          providerDiscount: providerDiscount ? Number(providerDiscount) : 0,
          providerPrice: providerPrice ? Number(providerPrice) : 0,
          providerCommission: providerCommission ? Number(providerCommission) : 0,
          status: status || "active",
        });
      }
    } else {
      providerPrices.push(...(existingService.providerPrices || []));
    }

    // --- Service Details ---
    const serviceDetails: any = {
      benefits: formData.has("benefits")
        ? JSON.parse((formData.get("benefits") as string) || "[]")
        : existingService.serviceDetails?.benefits || [],
      aboutUs: formData.has("aboutUs")
        ? JSON.parse((formData.get("aboutUs") as string) || "[]")
        : existingService.serviceDetails?.aboutUs || [],
      document: formData.has("document")
        ? JSON.parse((formData.get("document") as string) || "[]")
        : existingService.serviceDetails?.document || [],
      termsAndConditions: formData.has("termsAndConditions")
        ? JSON.parse((formData.get("termsAndConditions") as string) || "[]")
        : existingService.serviceDetails?.termsAndConditions || [],
      highlight: existingService.serviceDetails?.highlight || [],
      assuredByFetchTrue: existingService.serviceDetails?.assuredByFetchTrue || [],
      howItWorks: existingService.serviceDetails?.howItWorks || [],
      whyChooseUs: existingService.serviceDetails?.whyChooseUs || [],
      weRequired: existingService.serviceDetails?.weRequired || [],
      weDeliver: existingService.serviceDetails?.weDeliver || [],
      moreInfo: existingService.serviceDetails?.moreInfo || [],
      connectWith: existingService.serviceDetails?.connectWith || [],
      timeRequired: existingService.serviceDetails?.timeRequired || [],
      faq: existingService.serviceDetails?.faq || [],
      packages: existingService.serviceDetails?.packages || [],
      extraSections: existingService.serviceDetails?.extraSections || [],
      extraImages: existingService.serviceDetails?.extraImages || [],
    };

    // --- Highlights ---
    const highlightUpdated = Array.from(formData.keys()).some((key) =>
      key.startsWith("serviceDetails[highlight]")
    );
    if (highlightUpdated) {
      serviceDetails.highlight = [];
      for (const key of formData.keys()) {
        if (key.startsWith("serviceDetails[highlight]")) {
          const file = formData.get(key);
          if (file instanceof File && file.size > 0) {
            serviceDetails.highlight.push(await handleFileUpload(file, "/services/highlight"));
          }
        }
      }
    }

    // --- Sections with icon/image ---
    async function processSection(
      field: string,
      folder: string,
      mediaKey: "icon" | "image",
      existingData: any[]
    ): Promise<any[]> {
      const arr: any[] = [];
      const sectionUpdated = formData.has(`serviceDetails[${field}][0][title]`);

      if (!sectionUpdated) return existingData;

      for (let i = 0; i < 10; i++) {
        const title = formData.get(`serviceDetails[${field}][${i}][title]`) as string;
        if (!title) break;
        const description = formData.get(`serviceDetails[${field}][${i}][description]`) as string;
        const mediaFile = formData.get(`serviceDetails[${field}][${i}][${mediaKey}]`);

        let url = "";
        if (mediaFile instanceof File && mediaFile.size > 0) {
          url = await handleFileUpload(mediaFile, folder);
        } else if (existingData[i] && existingData[i][mediaKey]) {
          url = existingData[i][mediaKey];
        }

        arr.push({
          title: title.trim(),
          description: description?.trim() || "",
          [mediaKey]: url,
        });
      }
      return arr;
    }

    serviceDetails.assuredByFetchTrue = await processSection(
      "assuredByFetchTrue",
      "/services/assuredIcons",
      "icon",
      existingService.serviceDetails?.assuredByFetchTrue || []
    );

    serviceDetails.howItWorks = await processSection(
      "howItWorks",
      "/services/howItWorks",
      "icon",
      existingService.serviceDetails?.howItWorks || []
    );

    serviceDetails.whyChooseUs = await processSection(
      "whyChooseUs",
      "/services/whyChooseUs",
      "icon",
      existingService.serviceDetails?.whyChooseUs || []
    );

    serviceDetails.weRequired = await processSection(
      "weRequired",
      "/services/weRequired",
      "icon",
      existingService.serviceDetails?.weRequired || []
    );

    serviceDetails.weDeliver = await processSection(
      "weDeliver",
      "/services/weDeliver",
      "icon",
      existingService.serviceDetails?.weDeliver || []
    );

    serviceDetails.moreInfo = await processSection(
      "moreInfo",
      "/services/moreInfo",
      "image",
      existingService.serviceDetails?.moreInfo || []
    );

    // --- Connect With ---
    const connectWithUpdated = formData.has("serviceDetails[connectWith][0][name]");
    if (connectWithUpdated) {
      serviceDetails.connectWith = [];
      for (let i = 0; i < 10; i++) {
        const name = formData.get(`serviceDetails[connectWith][${i}][name]`) as string;
        if (!name) break;
        serviceDetails.connectWith.push({
          name: name.trim(),
          mobileNo: formData.get(`serviceDetails[connectWith][${i}][mobileNo]`) as string,
          email: formData.get(`serviceDetails[connectWith][${i}][email]`) as string,
        });
      }
    }

    // --- Time Required ---
    const timeRequiredUpdated = formData.has("serviceDetails[timeRequired][0][minDays]");
    if (timeRequiredUpdated) {
      serviceDetails.timeRequired = [];
      for (let i = 0; i < 10; i++) {
        const minDays = formData.get(`serviceDetails[timeRequired][${i}][minDays]`) as string;
        if (!minDays) break;
        serviceDetails.timeRequired.push({
          minDays: minDays.trim(),
          maxDays: (formData.get(`serviceDetails[timeRequired][${i}][maxDays]`) as string)?.trim() || "",
        });
      }
    }

    // --- FAQ ---
    const faqUpdated = formData.has("serviceDetails[faq][0][question]");
    if (faqUpdated) {
      serviceDetails.faq = [];
      for (let i = 0; i < 10; i++) {
        const question = formData.get(`serviceDetails[faq][${i}][question]`) as string;
        if (!question) break;
        const answer = formData.get(`serviceDetails[faq][${i}][answer]`) as string;
        serviceDetails.faq.push({
          question: question.trim(),
          answer: answer?.trim() || "",
        });
      }
    }

    // --- Packages ---
    const packagesUpdated = formData.has("serviceDetails[packages][0][name]");
    if (packagesUpdated) {
      serviceDetails.packages = [];
      for (let i = 0; i < 10; i++) {
        const name = formData.get(`serviceDetails[packages][${i}][name]`) as string;
        if (!name) break;
        const pkg: any = {
          name: name.trim(),
          price: Number(formData.get(`serviceDetails[packages][${i}][price]`) || 0),
          discount: Number(formData.get(`serviceDetails[packages][${i}][discount]`) || 0),
          discountedPrice: Number(formData.get(`serviceDetails[packages][${i}][discountedPrice]`) || 0),
          whatYouGet: [],
        };
        for (let j = 0; j < 10; j++) {
          const item = formData.get(`serviceDetails[packages][${i}][whatYouGet][${j}]`) as string;
          if (!item) break;
          pkg.whatYouGet.push(item.trim());
        }
        serviceDetails.packages.push(pkg);
      }
    }

    // --- Extra Images ---
    const extraImagesUpdated = Array.from(formData.keys()).some((key) =>
      key.startsWith("serviceDetails[extraImages]")
    );
    if (extraImagesUpdated) {
      serviceDetails.extraImages = [];
      for (const key of formData.keys()) {
        if (key.startsWith("serviceDetails[extraImages]")) {
          const file = formData.get(key);
          if (file instanceof File && file.size > 0) {
            serviceDetails.extraImages.push(await handleFileUpload(file, "/services/extraImages"));
          }
        }
      }
    }

    // --- Extra Sections ---
    const extraSectionsUpdated = formData.has("serviceDetails[extraSections][0][title]");
    if (extraSectionsUpdated) {
      serviceDetails.extraSections = [];
      for (let i = 0; i < 10; i++) {
        const title = formData.get(`serviceDetails[extraSections][${i}][title]`) as string;
        if (!title) break;

        const extraSection: any = {
          title: title.trim(),
          subtitle: [],
          description: [],
          subDescription: [],
          lists: [],
          tags: [],
          image: [],
        };

        // Process subtitle array
        for (let j = 0; j < 10; j++) {
          const subtitle = formData.get(`serviceDetails[extraSections][${i}][subtitle][${j}]`) as string;
          if (!subtitle) break;
          extraSection.subtitle.push(subtitle.trim());
        }

        // Process description array
        for (let j = 0; j < 10; j++) {
          const description = formData.get(`serviceDetails[extraSections][${i}][description][${j}]`) as string;
          if (!description) break;
          extraSection.description.push(description.trim());
        }

        // Process subDescription array
        for (let j = 0; j < 10; j++) {
          const subDescription = formData.get(
            `serviceDetails[extraSections][${i}][subDescription][${j}]`
          ) as string;
          if (!subDescription) break;
          extraSection.subDescription.push(subDescription.trim());
        }

        // Process lists array
        for (let j = 0; j < 10; j++) {
          const list = formData.get(`serviceDetails[extraSections][${i}][lists][${j}]`) as string;
          if (!list) break;
          extraSection.lists.push(list.trim());
        }

        // Process tags array
        for (let j = 0; j < 10; j++) {
          const tag = formData.get(`serviceDetails[extraSections][${i}][tags][${j}]`) as string;
          if (!tag) break;
          extraSection.tags.push(tag.trim());
        }

        // Process image array
        for (let j = 0; j < 10; j++) {
          const imageFile = formData.get(`serviceDetails[extraSections][${i}][image][${j}]`);
          if (imageFile instanceof File && imageFile.size > 0) {
            const url = await handleFileUpload(imageFile, "/services/extraSections");
            extraSection.image.push(url);
          } else {
            break;
          }
        }

        serviceDetails.extraSections.push(extraSection);
      }
    }

    // --- Franchise Details --- (Fixed duplicate declaration)
    const franchiseDetails: any = {
      commission: formData.has("franchiseDetails[commission]")
        ? (formData.get("franchiseDetails[commission]") as string)
        : existingService.franchiseDetails?.commission,
      termsAndConditions: formData.has("franchiseDetails[termsAndConditions]")
        ? (formData.get("franchiseDetails[termsAndConditions]") as string)
        : existingService.franchiseDetails?.termsAndConditions,
      investmentRange: existingService.franchiseDetails?.investmentRange || [],
      monthlyEarnPotential: existingService.franchiseDetails?.monthlyEarnPotential || [],
      franchiseModel: existingService.franchiseDetails?.franchiseModel || [],
      extraSections: existingService.franchiseDetails?.extraSections || [],
      extraImages: existingService.franchiseDetails?.extraImages || [],
    };

    // --- Investment Range ---
    const investmentRangeUpdated = formData.has("franchiseDetails[investmentRange][0][minRange]");
    if (investmentRangeUpdated) {
      franchiseDetails.investmentRange = [];
      for (let i = 0; i < 10; i++) {
        const min = formData.get(`franchiseDetails[investmentRange][${i}][minRange]`) as string;
        const max = formData.get(`franchiseDetails[investmentRange][${i}][maxRange]`) as string;
        if (!min) break;
        franchiseDetails.investmentRange.push({
          minRange: min.trim(),
          maxRange: max?.trim() || "",
        });
      }
    }

    // --- Monthly Earn Potential ---
    const monthlyEarnUpdated = formData.has("franchiseDetails[monthlyEarnPotential][0][minEarn]");
    if (monthlyEarnUpdated) {
      franchiseDetails.monthlyEarnPotential = [];
      for (let i = 0; i < 10; i++) {
        const min = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][minEarn]`) as string;
        const max = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][maxEarn]`) as string;
        if (!min) break;
        franchiseDetails.monthlyEarnPotential.push({
          minEarn: min.trim(),
          maxEarn: max?.trim() || "",
        });
      }
    }

    // --- Franchise Model ---
    const franchiseModelUpdated = formData.has("franchiseDetails[franchiseModel][0][title]");
    if (franchiseModelUpdated) {
      franchiseDetails.franchiseModel = [];
      for (let i = 0; i < 10; i++) {
        const title = formData.get(`franchiseDetails[franchiseModel][${i}][title]`) as string;
        if (!title) break;
        franchiseDetails.franchiseModel.push({
          title: title.trim(),
          agreement: (formData.get(`franchiseDetails[franchiseModel][${i}][agreement]`) as string)?.trim() || "",
          price: Number(formData.get(`franchiseDetails[franchiseModel][${i}][price]`) || 0),
          discount: Number(formData.get(`franchiseDetails[franchiseModel][${i}][discount]`) || 0),
          gst: Number(formData.get(`franchiseDetails[franchiseModel][${i}][gst]`) || 0),
          fees: (formData.get(`franchiseDetails[franchiseModel][${i}][fees]`) as string)?.trim() || "",
        });
      }
    }

    // --- Extra Images in Franchise Details ---
    const franchiseExtraImagesUpdated = Array.from(formData.keys()).some((key) =>
      key.startsWith("franchiseDetails[extraImages]")
    );
    if (franchiseExtraImagesUpdated) {
      franchiseDetails.extraImages = [];
      for (const key of formData.keys()) {
        if (key.startsWith("franchiseDetails[extraImages]")) {
          const file = formData.get(key);
          if (file instanceof File && file.size > 0) {
            franchiseDetails.extraImages.push(await handleFileUpload(file, "/services/franchise/extraImages"));
          }
        }
      }
    }

    // --- Extra Sections in Franchise Details ---
    const franchiseExtraSectionsUpdated = formData.has("franchiseDetails[extraSections][0][title]");
    if (franchiseExtraSectionsUpdated) {
      franchiseDetails.extraSections = [];
      for (let i = 0; i < 10; i++) {
        const title = formData.get(`franchiseDetails[extraSections][${i}][title]`) as string;
        if (!title) break;

        const extraSection: any = {
  title: title.trim(),
  subtitle: [],
  description: [],
  subDescription: [],
  lists: [],
  tags: [],
  image: [],
};


       // subtitle
for (let j = 0; j < 10; j++) {
  const val = formData.get(
    `franchiseDetails[extraSections][${i}][subtitle][${j}]`
  ) as string;
  if (!val) break;
  extraSection.subtitle.push(val.trim());
}

// --- description ---
for (let j = 0; j < 10; j++) {
  const description = formData.get(
    `franchiseDetails[extraSections][${i}][description][${j}]`
  ) as string;

  if (!description) break;
  extraSection.description.push(description.trim());
}

// --- subDescription ---
for (let j = 0; j < 10; j++) {
  const subDescription = formData.get(
    `franchiseDetails[extraSections][${i}][subDescription][${j}]`
  ) as string;

  if (!subDescription) break;
  extraSection.subDescription.push(subDescription.trim());
}

// --- lists ---
for (let j = 0; j < 10; j++) {
  const list = formData.get(
    `franchiseDetails[extraSections][${i}][lists][${j}]`
  ) as string;

  if (!list) break;
  extraSection.lists.push(list.trim());
}

// --- tags ---
for (let j = 0; j < 10; j++) {
  const tag = formData.get(
    `franchiseDetails[extraSections][${i}][tags][${j}]`
  ) as string;

  if (!tag) break;
  extraSection.tags.push(tag.trim());
}


        franchiseDetails.extraSections.push(extraSection);
      }
    }

    // --- Final Price Calculations ---
    const discountedPrice = discount ? Math.floor(price - price * (discount / 100)) : price;
    const gstInRupees = (discountedPrice * gst) / 100;
    const totalWithGst = discountedPrice + gstInRupees;

    // --- Update Service ---
    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        serviceName,
        category,
        subcategory,
        price,
        discount,
        gst,
        includeGst,
        discountedPrice,
        gstInRupees,
        totalWithGst,
        thumbnailImage,
        bannerImages,
        providerPrices,
        tags,
        keyValues,
        serviceDetails,
        franchiseDetails,
        recommendedServices,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { success: true, data: updatedService },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("🔥 UPDATE API ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Also add an OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/* =============================
   DELETE SERVICE BY ID
============================= */
export async function DELETE(req: Request) {
  await connectToDatabase();
  try {
    const id = extractId(req);
    if (!id) return NextResponse.json({ success: false, message: "ID missing" }, { status: 400, headers: corsHeaders });

    const service = await Service.findByIdAndDelete(id);
    if (!service) return NextResponse.json({ success: false, message: "Service not found" }, { status: 404, headers: corsHeaders });

    return NextResponse.json({ success: true, message: "Service deleted successfully" }, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: corsHeaders });
  }
}
