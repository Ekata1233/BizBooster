
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import { File } from "buffer";
import mongoose from "mongoose";
import "@/models/Category"
import "@/models/Subcategory"
import "@/models/Provider"
export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// export async function POST(req: NextRequest) {
//   await connectToDatabase();

//   try {
//     const formData = await req.formData();
   

//      console.log("=== FormData Entries ===" , formData);

//     const serviceName = formData.get("serviceName") as string;
//    const category = (formData.get("category") as string) || "";

//     if (!serviceName || serviceName.trim() === "") {
//       return NextResponse.json(
//         { success: false, message: "Service name is required" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     if (!category || category.trim() === "") {
//       return NextResponse.json(
//         { success: false, message: "Category is required" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Continue parsing other fields (use the already-obtained serviceName & category)
//     const subcategory = formData.get("subcategory") as string | null;
// const subcategoryId = subcategory && subcategory.trim() !== "" ? subcategory : null;

//     const price = Number(formData.get("price"));
//     const discount = Number(formData.get("discount") || 0);
//     const gst = Number(formData.get("gst") || 0);
//     const includeGst = formData.get("includeGst") === "true";

//     const recommendedServices = formData.get("recommendedServices") === "true";
//     const tags: string[] = [];
//     for (const key of formData.keys()) {
//       if (key.startsWith("tags[")) {
//         const val = formData.get(key) as string;
//         if (val) tags.push(val);
//       }
//     }

//     const keyValues: any[] = [];
//     for (let i = 0; ; i++) {
//       const key = formData.get(`keyValues[${i}][key]`);
//       const value = formData.get(`keyValues[${i}][value]`);

//       if (!key || !value) break;
//       keyValues.push({ key, value });
//     }

//    let thumbnailImage = "";

// const thumbnailFile = formData.get("thumbnail") as File | null;

// if (thumbnailFile && thumbnailFile instanceof File) {
//   const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
//   const upload = await imagekit.upload({
//     file: buffer,
//     fileName: `${uuidv4()}-${thumbnailFile.name}`,
//     folder: "/services/thumbnail",
//   });

//   thumbnailImage = upload.url;
// }


//     const bannerImages: string[] = [];

//     for (const [key, val] of formData.entries()) {
//       if (key.startsWith("bannerImages") && val instanceof File) {
//         const buffer = Buffer.from(await val.arrayBuffer());

//         const upload = await imagekit.upload({
//           file: buffer,
//           fileName: `${uuidv4()}-${val.name}`,
//           folder: "/services/banners",
//         });

//         bannerImages.push(upload.url);
//       }
//     }

//     const providerPrices: any[] = [];
//     for (let i = 0; ; i++) {
//       const provider = formData.get(`providerPrices[${i}][provider]`);
//       const providerMRP = formData.get(`providerPrices[${i}][providerMRP]`);
//       const providerDiscount = formData.get(
//         `providerPrices[${i}][providerDiscount]`
//       );
//       const providerPrice = formData.get(`providerPrices[${i}][providerPrice]`);
//       const providerCommission = formData.get(
//         `providerPrices[${i}][providerCommission]`
//       );
//       const status = formData.get(`providerPrices[${i}][status]`);

//       if (!provider) break;

//       providerPrices.push({
//         provider,
//         providerMRP,
//         providerDiscount,
//         providerPrice,
//         providerCommission,
//         status,
//       });
//     }

//     const serviceDetails = {
//       benefits: [],
//       aboutUs: [],
//       highlight: [],
//       document: [],
//       assuredByFetchTrue: [],
//       howItWorks: [],
//       termsAndConditions: [],
//       faq: [],
//       extraSections: [],
//       whyChooseUs: [],
//       packages: [],
//       weRequired: [],
//       weDeliver: [],
//       moreInfo: [],
//       connectWith: [],
//       timeRequired: [],
//       extraImages: [],
//     };

//     // Helper function to extract list of objects (title + description)
// async function handleFileUpload(
//   fileOrBlob: File | string,
//   folder: string,
//   prefix: string
// ) {
//   // Case 1: Real File from formData
//   if (typeof fileOrBlob === "object" && "arrayBuffer" in fileOrBlob) {
//     const buffer = Buffer.from(await fileOrBlob.arrayBuffer());

//     const upload = await imagekit.upload({
//       file: buffer,
//       fileName: `${uuidv4()}-${prefix}`,
//       folder,
//     });

//     return upload.url;
//   }

//   // Case 2: blob: URL (client preview image)
//   if (typeof fileOrBlob === "string" && fileOrBlob.startsWith("blob:")) {
//     const res = await fetch(fileOrBlob);
//     const blob = await res.arrayBuffer();

//     const upload = await imagekit.upload({
//       file: Buffer.from(blob),
//       fileName: `${uuidv4()}-${prefix}.png`,
//       folder,
//     });

//     return upload.url;
//   }

//   return "";
// }



// async function processSectionWithIcon(fieldName: string, folder: string , mediaKey: "icon" | "image") {
//   const arr: any[] = [];
//   for (let i = 0; ; i++) {
//     const title = formData.get(`serviceDetails[${fieldName}][${i}][title]`);
//     const description = formData.get(`serviceDetails[${fieldName}][${i}][description]`);
//     if (!title) break;

//     const iconOrImage = formData.get(`serviceDetails[${fieldName}][${i}][icon]`) 
//                      || formData.get(`serviceDetails[${fieldName}][${i}][image]`);

//     let uploadedURL = "";
//     if (iconOrImage) {
//       uploadedURL = await handleFileUpload(iconOrImage as File | string, folder, `${fieldName}-${i}`);
//     }

//     arr.push({ title, description,  [mediaKey]: uploadedURL, });
//   }
//   return arr;
// }

// // Then use it:
// serviceDetails.assuredByFetchTrue = await processSectionWithIcon("assuredByFetchTrue", "/services/assuredIcons", "icon");
// serviceDetails.howItWorks = await processSectionWithIcon("howItWorks", "/services/howItWorks", "icon");
// serviceDetails.whyChooseUs = await processSectionWithIcon("whyChooseUs", "/services/whyChooseUs", "icon");
// serviceDetails.weRequired = await processSectionWithIcon("weRequired", "/services/weRequired", "icon");
// serviceDetails.weDeliver = await processSectionWithIcon("weDeliver", "/services/weDeliver", "icon");
// serviceDetails.moreInfo = await processSectionWithIcon("moreInfo", "/services/moreInfo", "image");


// // Packages
// serviceDetails.packages = [];
// for (let i = 0; ; i++) {
//   const name = formData.get(`serviceDetails[packages][${i}][name]`);
//   if (!name) break;

//   const pkg: any = {
//     name,
//     price: formData.get(`serviceDetails[packages][${i}][price]`),
//     discount: formData.get(`serviceDetails[packages][${i}][discount]`),
//     discountedPrice: formData.get(`serviceDetails[packages][${i}][discountedPrice]`),
//     whatYouGet: []
//   };

//   for (let j = 0; ; j++) {
//     const item = formData.get(`serviceDetails[packages][${i}][whatYouGet][${j}]`);
//     if (!item) break;
//     pkg.whatYouGet.push(item);
//   }

//   serviceDetails.packages.push(pkg);
// }
// serviceDetails.termsAndConditions = formData.get("serviceDetails[termsAndConditions]") || "";

// // Connect With
// serviceDetails.connectWith = [];
// for (let i = 0; ; i++) {
//   const name = formData.get(`serviceDetails[connectWith][${i}][name]`);
//   if (!name) break;

//   serviceDetails.connectWith.push({
//     name,
//     mobileNo: formData.get(`serviceDetails[connectWith][${i}][mobileNo]`),
//     email: formData.get(`serviceDetails[connectWith][${i}][email]`)
//   });
// }

// // Time Required
// serviceDetails.timeRequired = [];
// for (let i = 0; ; i++) {
//   const minDays = formData.get(`serviceDetails[timeRequired][${i}][minDays]`);
//   const maxDays = formData.get(`serviceDetails[timeRequired][${i}][maxDays]`);
//   if (!minDays) break;

//   serviceDetails.timeRequired.push({ minDays, maxDays });
// }


//    const arrayOfStringFields = [
//   "benefits",
//   "aboutUs",
//   "document",
//   "termsAndConditions",
// ];

// arrayOfStringFields.forEach((field) => {
//   const val = formData.get(`serviceDetails[${field}]`) as string | null;
//   if (val) {
//     try {
//       serviceDetails[field] = JSON.parse(val);
//     } catch (e) {
//       serviceDetails[field] = [];
//     }
//   } else {
//     serviceDetails[field] = [];
//   }
// });
// const objectArrayFields = [
//   "assuredByFetchTrue",
//   "howItWorks",
//   "whyChooseUs",
//   "weRequired",
//   "weDeliver",
//   "moreInfo",
//   "connectWith",
//   "timeRequired",
//   "faq",
//   "packages",
//   "extraSections"
// ];

// objectArrayFields.forEach((field) => {
//   const val = formData.get(`serviceDetails[${field}]`) as string | null;
//   if (val) {
//     try {
//       serviceDetails[field] = JSON.parse(val);
//     } catch (e) {
//       serviceDetails[field] = [];
//     }
//   } else {
//     serviceDetails[field] = [];
//   }
// });

//     // Upload highlight images
// serviceDetails.highlight = []; // reset

// for (const [key, value] of formData.entries()) {
//   if (key.startsWith("serviceDetails[highlight]")) {
//     // value can be a File or an array of Files
//     if (Array.isArray(value)) {
//       for (const file of value) {
//         if (file instanceof File) {
//           const buffer = Buffer.from(await file.arrayBuffer());
//           const upload = await imagekit.upload({
//             file: buffer,
//             fileName: `${uuidv4()}-${file.name}`,
//             folder: "/services/highlight",
//           });
//           serviceDetails.highlight.push(upload.url);
//         }
//       }
//     } else if (value instanceof File) {
//       const buffer = Buffer.from(await value.arrayBuffer());
//       const upload = await imagekit.upload({
//         file: buffer,
//         fileName: `${uuidv4()}-${value.name}`,
//         folder: "/services/highlight",
//       });
//       serviceDetails.highlight.push(upload.url);
//     }
//   }
// }


//     // Faq
//     for (let i = 0; ; i++) {
//       const question = formData.get(`serviceDetails[faq][${i}][question]`);
//       const answer = formData.get(`serviceDetails[faq][${i}][answer]`);
//       if (!question || !answer) break;
//       serviceDetails.faq.push({ question, answer });
//     }

// serviceDetails.extraImages = [];

// for (const [key, value] of formData.entries()) {
//   if (key.startsWith("serviceDetails[extraImages]")) {
//     if (value instanceof File) {
//       const buffer = Buffer.from(await value.arrayBuffer());
//       const upload = await imagekit.upload({
//         file: buffer,
//         fileName: `${uuidv4()}-${value.name}`,
//         folder: "/services/extras/images",
//       });
//       serviceDetails.extraImages.push(upload.url); // always push URL, not object
//     }
//   }
// }





//     // Extra Sections
//     for (let i = 0; ; i++) {
//       const title = formData.get(`serviceDetails[extraSections][${i}][title]`);
//       if (!title) break;

//       const section: any = { title, subtitle: [], image: [], description: [], subDescription: [], lists: [], tags: [] };

//       ["subtitle", "description", "subDescription", "lists", "tags"].forEach(
//         (field) => {
//           const arr: string[] = [];
//           for (const key of formData.keys()) {
//             if (
//               key.startsWith(
//                 `serviceDetails[extraSections][${i}][${field}]`
//               )
//             ) {
//               const val = formData.get(key) as string;
//               if (val) arr.push(val);
//             }
//           }
//           section[field] = arr;
//         }
//       );

//       // extraSections images upload
//       for (const [key, value] of formData.entries()) {
//         if (
//           key.startsWith(
//             `serviceDetails[extraSections][${i}][image]`
//           ) &&
//           value instanceof File
//         ) {
//           const buffer = Buffer.from(await value.arrayBuffer());
//           const upload = await imagekit.upload({
//             file: buffer,
//             fileName: `${uuidv4()}-${value.name}`,
//             folder: "/services/extras",
//           });
//           section.image.push(upload.url);
//         }
//       }

//       serviceDetails.extraSections.push(section);
//     }

//     const franchiseDetails = {
//       commission: formData.get("franchiseDetails[commission]"),
//       termsAndConditions: formData.get("franchiseDetails[termsAndConditions]"),
//       investmentRange: [],
//       monthlyEarnPotential: [],
//       franchiseModel: [],
//       extraSections: [],
//       extraImages: [],
//     };

//     for (let i = 0; ; i++) {
//       const minRange = formData.get(`franchiseDetails[investmentRange][${i}][minRange]`);
//       const maxRange = formData.get(`franchiseDetails[investmentRange][${i}][maxRange]`);
//       if (!minRange || !maxRange) break;
//       franchiseDetails.investmentRange.push({ minRange, maxRange });
//     }

//     for (let i = 0; ; i++) {
//       const minEarn = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][minEarn]`);
//       const maxEarn = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][maxEarn]`);
//       if (!minEarn || !maxEarn) break;
//       franchiseDetails.monthlyEarnPotential.push({ minEarn, maxEarn });
//     }

//     for (let i = 0; ; i++) {
//       const title = formData.get(`franchiseDetails[franchiseModel][${i}][title]`);
//       if (!title) break;

//       franchiseDetails.franchiseModel.push({
//         title,
//         agreement: formData.get(`franchiseDetails[franchiseModel][${i}][agreement]`),
//         price: formData.get(`franchiseDetails[franchiseModel][${i}][price]`),
//         discount: formData.get(`franchiseDetails[franchiseModel][${i}][discount]`),
//         gst: formData.get(`franchiseDetails[franchiseModel][${i}][gst]`),
//         fees: formData.get(`franchiseDetails[franchiseModel][${i}][fees]`),
//       });
//     }

//     // Franchise Extra Sections
// for (let i = 0; ; i++) {
//   const title = formData.get(`franchiseDetails[extraSections][${i}][title]`);
//   if (!title) break;

//   const section: any = { title, subtitle: [], description: [], subDescription: [], lists: [], tags: [], image: [] };

//   ["subtitle", "description", "subDescription", "lists", "tags"].forEach(
//     (field) => {
//       const arr: string[] = [];
//       for (const key of formData.keys()) {
//         if (
//           key.startsWith(`franchiseDetails[extraSections][${i}][${field}]`)
//         ) {
//           const val = formData.get(key) as string;
//           if (val) arr.push(val);
//         }
//       }
//       section[field] = arr;
//     }
//   );

//   // Upload images
//   for (const [key, value] of formData.entries()) {
//     if (
//       key.startsWith(`franchiseDetails[extraSections][${i}][image]`) &&
//       value instanceof File
//     ) {
//       const buffer = Buffer.from(await value.arrayBuffer());
//       const upload = await imagekit.upload({
//         file: buffer,
//         fileName: `${uuidv4()}-${value.name}`,
//         folder: "/services/franchise/extras",
//       });
//       section.image.push(upload.url);
//     }
//   }

//   franchiseDetails.extraSections.push(section);
// }


// // Franchise Extra Images Upload
// for (const [key, value] of formData.entries()) {
//   if (key.startsWith("franchiseDetails[extraImages]") && value instanceof File) {
//     const buffer = Buffer.from(await value.arrayBuffer());
//     const upload = await imagekit.upload({
//       file: buffer,
//       fileName: `${uuidv4()}-${value.name}`,
//       folder: "/services/franchise/extraImages",
//     });
//     franchiseDetails.extraImages.push(upload.url);
//   }
// }


//     const discountedPrice = discount
//       ? Math.floor(price - price * (discount / 100))
//       : price;

//     const gstInRupees = (discountedPrice * gst) / 100;
//     const totalWithGst = discountedPrice + gstInRupees;

//     const newService = await Service.create({
//       serviceName: serviceName.trim(),
//       category,
//        subcategory: subcategoryId  ,
//       price,
//       discount,
//       gst,
//       includeGst,
//       discountedPrice,
//       gstInRupees,
//       totalWithGst,
//       thumbnailImage,
//       bannerImages,
//       providerPrices,
//       tags,
//       keyValues,
//       serviceDetails,
//       franchiseDetails,
//       isDeleted: false,
//       recommendedServices,
//     });

//     return NextResponse.json(
//       { success: true, data: newService },
//       { status: 201, headers: corsHeaders }
//     );

//   } catch (error: any) {
//      console.log("🔥 API ERROR:", error);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    console.log("-------------formdata : ", formData);

    // --- Basic Fields ---
    const serviceName = (formData.get("serviceName") as string)?.trim();
    const category = (formData.get("category") as string)?.trim();
    const subcategory = (formData.get("subcategory") as string)?.trim() || null;
    const price = Number(formData.get("price") || 0);
    const discount = Number(formData.get("discount") || 0);
    const gst = Number(formData.get("gst") || 0);
    const includeGst = formData.get("includeGst") === "true";
    const recommendedServices = formData.get("recommendedServices") === "true";

    if (!serviceName) return NextResponse.json({ success: false, message: "Service name is required" }, { status: 400, headers: corsHeaders });
    if (!category) return NextResponse.json({ success: false, message: "Category is required" }, { status: 400, headers: corsHeaders });

    // --- Tags ---
    const tags: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("tags[")) {
        const val = formData.get(key) as string;
        if (val) tags.push(val);
      }
    }

    // --- Key Values ---
    const keyValues: any[] = [];
    for (let i = 0; i < 1000; i++) {
      const key = formData.get(`keyValues[${i}][key]`);
      const value = formData.get(`keyValues[${i}][value]`);
      if (!key || !value) break;
      keyValues.push({ key, value });
    }

    // --- Thumbnail ---
    let thumbnailImage = "";
    const thumbnailFile = formData.get("thumbnail") as File | null;
    if (thumbnailFile instanceof File) {
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const upload = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${thumbnailFile.name}`,
        folder: "/services/thumbnail",
      });
      thumbnailImage = upload.url;
    }

    // --- Banner Images ---
    const bannerImages: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("bannerImages")) {
        const file = formData.get(key);
        if (file instanceof File) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const upload = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${file.name}`,
            folder: "/services/banners",
          });
          bannerImages.push(upload.url);
        }
      }
    }

    // --- Provider Prices ---
    const providerPrices: any[] = [];
    for (let i = 0; i < 1000; i++) {
      const provider = formData.get(`providerPrices[${i}][provider]`);
      if (!provider) break;
      providerPrices.push({
        provider,
        providerMRP: formData.get(`providerPrices[${i}][providerMRP]`),
        providerDiscount: formData.get(`providerPrices[${i}][providerDiscount]`),
        providerPrice: formData.get(`providerPrices[${i}][providerPrice]`),
        providerCommission: formData.get(`providerPrices[${i}][providerCommission]`),
        status: formData.get(`providerPrices[${i}][status]`),
      });
    }

    // --- Helper: Upload File ---
    async function handleFileUpload(file: File, folder: string) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const upload = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${file.name}`,
        folder,
      });
      return upload.url;
    }

    // --- Service Details ---
    const serviceDetails: any = {
      benefits: JSON.parse(formData.get("benefits") as string || "[]"),
      aboutUs: JSON.parse(formData.get("aboutUs") as string || "[]"),
      document: JSON.parse(formData.get("document") as string || "[]"),
      termsAndConditions: JSON.parse(formData.get("termsAndConditions") as string || "[]"),
      highlight: [],
      assuredByFetchTrue: [],
      howItWorks: [],
      whyChooseUs: [],
      weRequired: [],
      weDeliver: [],
      moreInfo: [],
      connectWith: [],
      timeRequired: [],
      faq: [],
      packages: [],
      extraSections: [],
      extraImages: [],
    };

    // --- Highlights ---
    for (const key of formData.keys()) {
      if (key.startsWith("serviceDetails[highlight]")) {
        const file = formData.get(key);
        if (file instanceof File) serviceDetails.highlight.push(await handleFileUpload(file, "/services/highlight"));
      }
    }

    // --- Sections with icon/image ---
    async function processSection(field: string, folder: string, mediaKey: "icon" | "image") {
      const arr: any[] = [];
      for (let i = 0; i < 1000; i++) {
        const title = formData.get(`serviceDetails[${field}][${i}][title]`);
        if (!title) break;
        const description = formData.get(`serviceDetails[${field}][${i}][description]`);
        const mediaFile = formData.get(`serviceDetails[${field}][${i}][${mediaKey}]`);
        let url = "";
        if (mediaFile instanceof File) url = await handleFileUpload(mediaFile, folder);
        arr.push({ title, description, [mediaKey]: url });
      }
      return arr;
    }

    serviceDetails.assuredByFetchTrue = await processSection("assuredByFetchTrue", "/services/assuredIcons", "icon");
    serviceDetails.howItWorks = await processSection("howItWorks", "/services/howItWorks", "icon");
    serviceDetails.whyChooseUs = await processSection("whyChooseUs", "/services/whyChooseUs", "icon");
    serviceDetails.weRequired = await processSection("weRequired", "/services/weRequired", "icon");
    serviceDetails.weDeliver = await processSection("weDeliver", "/services/weDeliver", "icon");
    serviceDetails.moreInfo = await processSection("moreInfo", "/services/moreInfo", "image");

    // --- Connect With ---
    for (let i = 0; i < 1000; i++) {
      const name = formData.get(`serviceDetails[connectWith][${i}][name]`);
      if (!name) break;
      serviceDetails.connectWith.push({
        name,
        mobileNo: formData.get(`serviceDetails[connectWith][${i}][mobileNo]`),
        email: formData.get(`serviceDetails[connectWith][${i}][email]`),
      });
    }

    // --- Time Required ---
    for (let i = 0; i < 1000; i++) {
      const minDays = formData.get(`serviceDetails[timeRequired][${i}][minDays]`);
      if (!minDays) break;
      serviceDetails.timeRequired.push({
        minDays,
        maxDays: formData.get(`serviceDetails[timeRequired][${i}][maxDays]`),
      });
    }

    // --- FAQ ---
    for (let i = 0; i < 1000; i++) {
      const question = formData.get(`serviceDetails[faq][${i}][question]`);
      if (!question) break;
      const answer = formData.get(`serviceDetails[faq][${i}][answer]`);
      serviceDetails.faq.push({ question, answer });
    }

    // --- Packages ---
    for (let i = 0; i < 1000; i++) {
      const name = formData.get(`serviceDetails[packages][${i}][name]`);
      if (!name) break;
      const pkg: any = {
        name,
        price: formData.get(`serviceDetails[packages][${i}][price]`),
        discount: formData.get(`serviceDetails[packages][${i}][discount]`),
        discountedPrice: formData.get(`serviceDetails[packages][${i}][discountedPrice]`),
        whatYouGet: [],
      };
      for (let j = 0; j < 1000; j++) {
        const item = formData.get(`serviceDetails[packages][${i}][whatYouGet][${j}]`);
        if (!item) break;
        pkg.whatYouGet.push(item);
      }
      serviceDetails.packages.push(pkg);
    }

    // --- Franchise Details ---
    const franchiseDetails: any = {
      commission: formData.get("franchiseDetails[commission]"),
      termsAndConditions: formData.get("franchiseDetails[termsAndConditions]"),
      investmentRange: [],
      monthlyEarnPotential: [],
      franchiseModel: [],
      extraSections: [],
      extraImages: [],
    };

    for (let i = 0; i < 1000; i++) {
      const min = formData.get(`franchiseDetails[investmentRange][${i}][minRange]`);
      const max = formData.get(`franchiseDetails[investmentRange][${i}][maxRange]`);
      if (!min) break;
      franchiseDetails.investmentRange.push({ minRange: min, maxRange: max });
    }

    for (let i = 0; i < 1000; i++) {
      const min = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][minEarn]`);
      const max = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][maxEarn]`);
      if (!min) break;
      franchiseDetails.monthlyEarnPotential.push({ minEarn: min, maxEarn: max });
    }

    for (let i = 0; i < 1000; i++) {
      const title = formData.get(`franchiseDetails[franchiseModel][${i}][title]`);
      if (!title) break;
      franchiseDetails.franchiseModel.push({
        title,
        agreement: formData.get(`franchiseDetails[franchiseModel][${i}][agreement]`),
        price: formData.get(`franchiseDetails[franchiseModel][${i}][price]`),
        discount: formData.get(`franchiseDetails[franchiseModel][${i}][discount]`),
        gst: formData.get(`franchiseDetails[franchiseModel][${i}][gst]`),
        fees: formData.get(`franchiseDetails[franchiseModel][${i}][fees]`),
      });
    }

    // --- Final Price Calculations ---
    const discountedPrice = discount ? Math.floor(price - price * (discount / 100)) : price;
    const gstInRupees = (discountedPrice * gst) / 100;
    const totalWithGst = discountedPrice + gstInRupees;

    // --- Save Service ---
    const newService = await Service.create({
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
      isDeleted: false,
      recommendedServices,
    });

    return NextResponse.json({ success: true, data: newService }, { status: 201, headers: corsHeaders });
  } catch (err: any) {
    console.error("🔥 API ERROR:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500, headers: corsHeaders });
  }
}

const removeEmpty = (value: any): any => {
  // ✅ keep ObjectId & Date untouched
  if (
    value instanceof mongoose.Types.ObjectId ||
    value instanceof Date
  ) {
    return value;
  }

  // remove empty string
  if (value === "") return undefined;

  // handle arrays
  if (Array.isArray(value)) {
    const cleanedArray = value
      .map(removeEmpty)
      .filter(v => v !== undefined);

    return cleanedArray.length > 0 ? cleanedArray : undefined;
  }

  // handle objects
  if (typeof value === "object" && value !== null) {
    const cleanedObject: any = {};

    for (const key in value) {
      const cleanedValue = removeEmpty(value[key]);

      if (cleanedValue !== undefined) {
        cleanedObject[key] = cleanedValue;
      }
    }

    return Object.keys(cleanedObject).length > 0 ? cleanedObject : undefined;
  }

  // keep numbers, booleans, valid strings
  return value;
};



// NEW PAGINATION
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const sort = searchParams.get("sort");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : null;
    const skip = limit ? (page - 1) * limit : 0;

    const filter: Record<string, unknown> = { isDeleted: false };

    if (search) {
      filter.serviceName = { $regex: `\\b${search}[a-zA-Z]*`, $options: "i" };
    }

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;

    let sortOption: Record<string, 1 | -1> = {};

    switch (sort) {
      case "latest": sortOption = { createdAt: -1 }; break;
      case "oldest": sortOption = { createdAt: 1 }; break;
      case "ascending": sortOption = { serviceName: 1 }; break;
      case "descending": sortOption = { serviceName: -1 }; break;
      case "asc": sortOption = { price: 1 }; break;
      case "desc": sortOption = { price: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const total = await Service.countDocuments(filter);

    let query = Service.find(filter)
      .populate("category")
      .populate("subcategory")
      .populate({
        path: "providerPrices.provider",
        select: "fullName storeInfo.storeName storeInfo.logo",
      })
      .sort({ sortOrder: 1, ...sortOption })
      .lean(); // ✅ IMPORTANT

    if (limit) query = query.skip(skip).limit(limit);

    const services = await query.exec();

    /* ✅ CLEAN + SAFE RESPONSE */
    const cleanedServices = services
      .map(service => removeEmpty(service))
      .filter(Boolean);

    return NextResponse.json(
      {
        success: true,
        page: limit ? page : 1,
        limit: limit ?? total,
        total,
        totalPages: limit ? Math.ceil(total / limit) : 1,
        data: cleanedServices,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Unknown error" },
      { status: 500, headers: corsHeaders }
    );
  }
}





