export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import mongoose from "mongoose";
      `1`
import "@/models/Category";
import "@/models/Subcategory";
import "@/models/Provider";
import MostHomeServices from "@/models/MostHomeServices";
import Category from "@/models/Category";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Also add an OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

function extractId(req: Request | NextRequest) {
  const url = new URL(req.url);
  return url.pathname.split("/").pop();
}

export const removeEmpty = (value: any): any => {
  // Check for Date object
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return value;
  }
  
  // Check for ObjectId (works on both client and server)
  if (
    value &&
    typeof value === 'object' &&
    value._bsontype === 'ObjectId' &&
    typeof value.toString === 'function'
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

    return Object.keys(cleanedObject).length > 0
      ? cleanedObject
      : undefined;
  }

  // keep numbers, booleans, valid strings
  return value;
};

/* =============================
   GET SERVICE BY ID
============================= */
export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const id = extractId(req);
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID missing" },
        { status: 400, headers: corsHeaders }
      );
    }

    const service = await Service.findById(id)
      .populate("category")
      .populate("subcategory")
      .populate({
        path: "providerPrices.provider",
        model: "Provider",
        select: "fullName storeInfo.storeName storeInfo.logo",
      })
      .lean(); // ✅ IMPORTANT

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // ✅ CLEAN EMPTY STRINGS & ARRAYS
    const cleanedService = removeEmpty(service);

    return NextResponse.json(
      { success: true, data: cleanedService },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

/* =============================
   DELETE SERVICE BY ID
============================= */

export async function DELETE(req: Request) {
  await connectToDatabase();
  try {
    const id = extractId(req);
    if (!id)
      return NextResponse.json(
        { success: false, message: "ID missing" },
        { status: 400, headers: corsHeaders }
      );

      const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        isTrending: false,
        recommendedServices: false,
      },
      { new: true }
    );

    if (!updatedService) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // delete service
    const service = await Service.findByIdAndDelete(id);
    if (!service)
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404, headers: corsHeaders }
      );

    // 🔥 AUTO DELETE FROM MOST HOME SERVICES
   await MostHomeServices.deleteOne({
  service: new mongoose.Types.ObjectId(id),
});


    // 🔹 Delete all offers linked to this service
    const Offer = mongoose.model("Offer"); // lazy-load model
    await Offer.deleteMany({ service: id });

    return NextResponse.json(
      { success: true, message: "Service and related offers deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

/* =============================
   PATCH SERVICE BY ID
============================= */
async function checkModuleLimit(
  serviceId: any,
  categoryId: any,
  field: "recommendedServices" | "isTrending",
  limit = 10
) {
  const category = await Category.findById(categoryId).select("module");

  if (!category?.module) {
    throw new Error("Module not found for category");
  }

  const result = await Service.aggregate([
    {
      $match: {
        [field]: true,
        _id: { $ne: serviceId }
      }
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category"
      }
    },
    { $unwind: "$category" },
    {
      $match: {
        "category.module": category.module
      }
    },
    { $count: "total" }
  ]);

  return result[0]?.total || 0;
}

export async function PATCH(req: NextRequest) {
  await connectToDatabase();

  try {
    const id = extractId(req);
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID missing" },
        { status: 400, headers: corsHeaders }
      );
    }

    const service = await Service.findById(id);
    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const formData = await req.formData();
    const updateData: any = {};

    console.log("formdata for the update : ", formData);
    /* -----------------------------
       HANDLE NORMAL FIELDS
    ----------------------------- */
    for (const [key, value] of formData.entries()) {
      if (value === "" || value === null) continue;

      // Boolean handling
      if (value === "true") {
        updateData[key] = true;
      } else if (value === "false") {
        updateData[key] = false;
      }
      // JSON fields (arrays / objects)
      else if (typeof value === "string" && value.startsWith("{") || value.startsWith("[")) {
        try {
          updateData[key] = JSON.parse(value);
        } catch {
          updateData[key] = value;
        }
      }
      // Normal strings / numbers
      else {
        updateData[key] = value;
      }
    }

    /* -----------------------------
       HANDLE IMAGE UPLOAD (ImageKit)
    ----------------------------- */
    const imageFile = formData.get("image") as File | null;

    if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile && 'name' in imageFile) {
  const buffer = Buffer.from(await imageFile.arrayBuffer());
      

      const uploadRes = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${imageFile.name}`,
        folder: "/services",
      });

      updateData.image = uploadRes.url;
    }

    /* -----------------------------
       CLEAN EMPTY VALUES
    ----------------------------- */
    const cleanedData = removeEmpty(updateData);

    console.log("cleaned Data : ", cleanedData);

    const categoryId = cleanedData.category || service.category;

    /* =============================
       RECOMMENDED SERVICES LIMIT
    ============================= */
    if (cleanedData.recommendedServices === true && service.recommendedServices !== true) {
      const count = await checkModuleLimit(
        service._id,
        categoryId,
        "recommendedServices"
      );
    
      if (count >= 10) {
        return NextResponse.json(
          {
            success: false,
            message: "You can recommend only 10 services per module"
          },
          { status: 400, headers: corsHeaders }
        );
      }
    }
    
    /* =============================
       TRENDING SERVICES LIMIT
    ============================= */
    if (cleanedData.isTrending === true && service.isTrending !== true) {
      const count = await checkModuleLimit(
        service._id,
        categoryId,
        "isTrending"
      );
    
      if (count >= 10) {
        return NextResponse.json(
          {
            success: false,
            message: "You can recommend only 10 services per module"
          },
          { status: 400, headers: corsHeaders }
        );
      }
    }
       

    /* -----------------------------
       UPDATE SERVICE
    ----------------------------- */
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { $set: cleanedData },
      { new: true }
    )
      .populate("category")
      .populate("subcategory")
      .populate({
        path: "providerPrices.provider",
        model: "Provider",
        select: "fullName storeInfo.storeName storeInfo.logo",
      })
      .lean();

    return NextResponse.json(
      { success: true, data: updatedService },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}


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
    
    console.log("formdate for the update : ", formData);

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

    const keyValueIndexes = new Set<number>();

for (const key of formData.keys()) {
  const match = key.match(/keyValues\[(\d+)\]/);
  if (match) keyValueIndexes.add(Number(match[1]));
}

    // --- Key Values ---
const keyValues: {
  key?: string;
  value?: string;
  icon?: string;
}[] = [];

if (keyValueIndexes.size > 0) {
  for (const index of [...keyValueIndexes].sort()) {
    const rawKey = formData.get(`keyValues[${index}][key]`) as string | null;
    const rawValue = formData.get(`keyValues[${index}][value]`) as string | null;
    const iconFile = formData.get(`keyValues[${index}][icon]`);

    const key = rawKey?.trim() || "";
    const value = rawValue?.trim() || "";

    let iconUrl = "";

    if (
      iconFile &&
      typeof iconFile === "object" &&
      "size" in iconFile &&
      iconFile.size > 0
    ) {
      iconUrl = await handleFileUpload(iconFile, "/services/key-values");
    }
    else if (typeof iconFile === "string" && iconFile.startsWith("http")) {
      iconUrl = iconFile;
    }

    if (key || value || iconUrl) {
      keyValues.push({
        key,
        value,
        icon: iconUrl,
      });
    }
  }
} else {
  keyValues.push(...(existingService.keyValues || []));
}

async function handleFileUpload(
  file: any,
  folder: string
): Promise<string> {
  // Return empty string if no file
  if (!file) return "";
  
  // Check if it's a file object (works on both client and server)
  const isFile = (
    file &&
    typeof file === 'object' &&
    'arrayBuffer' in file &&
    'size' in file &&
    'name' in file &&
    'type' in file
  );
  
  // If it's a File object with content
  if (isFile && file.size > 0) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (buffer.length > maxSize) {
        throw new Error(`File size too large. Maximum size is 5MB.`);
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`);
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
  
  // If it's a blob URL (should be handled on client side)
  if (typeof file === "string" && file.startsWith("blob:")) {
    try {
      console.log("Fetching blob URL for upload:", file);
      
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const maxSize = 5 * 1024 * 1024;
      if (buffer.length > maxSize) {
        throw new Error(`File size too large. Maximum size is 5MB.`);
      }

      const upload = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-uploaded-file`,
        folder,
      });
      
      console.log("Successfully uploaded blob to:", upload.url);
      return upload.url;
    } catch (error) {
      console.error("Error uploading blob URL:", error);
      return "";
    }
  }
  
  // If it's already a proper URL (not blob), return it
  if (typeof file === "string" && file.startsWith("http")) {
    return file;
  }
  
  return "";
}

    // --- Thumbnail ---
    let thumbnailImage = existingService.thumbnailImage || "";
    const thumbnailFile = formData.get("thumbnail");
if (thumbnailFile && typeof thumbnailFile === 'object' && 'size' in thumbnailFile && thumbnailFile.size > 0) {
      thumbnailImage = await handleFileUpload(thumbnailFile, "/services/thumbnail");
    }

    // --- Banner Images ---
    let bannerImages: string[] = existingService.bannerImages || [];
    const bannerImagesUpdated = Array.from(formData.keys()).some((key) =>
      key.startsWith("bannerImages")
    );

    if (bannerImagesUpdated) {
     const bannerUploadPromises: Promise<string>[] = [];

for (const key of formData.keys()) {
  if (key.startsWith("bannerImages")) {
    const file = formData.get(key);
    if (file && typeof file === "object" && "size" in file && file.size > 0) {
      bannerUploadPromises.push(handleFileUpload(file, "/services/banners"));
    }
  }
}

bannerImages = (await Promise.all(bannerUploadPromises)).filter(Boolean);

    }

    // --- Provider Prices ---
    const providerPrices: any[] = [];
    const providerPricesUpdated = formData.has("providerPrices[0][provider]");
    if (providerPricesUpdated) {
      for (let i = 0; i < 6; i++) {
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
       operatingCities: existingService.serviceDetails?.operatingCities || [],
  brochureImage: existingService.serviceDetails?.brochureImage || [],
  emiavalable: existingService.serviceDetails?.emiavalable || [],
  counter: existingService.serviceDetails?.counter || [],
  franchiseOperatingModel: existingService.serviceDetails?.franchiseOperatingModel || [],
  businessFundamental: existingService.serviceDetails?.businessFundamental || {},
  keyAdvantages: existingService.serviceDetails?.keyAdvantages || [],
  completeSupportSystem: existingService.serviceDetails?.completeSupportSystem || [],
  trainingDetails: existingService.serviceDetails?.trainingDetails || [],
  agreementDetails: existingService.serviceDetails?.agreementDetails || [],
  goodThings: existingService.serviceDetails?.goodThings || [],
  compareAndChoose: existingService.serviceDetails?.compareAndChoose || [],
  companyDetails: existingService.serviceDetails?.companyDetails || [],
  roi: existingService.serviceDetails?.roi || [],
  level: existingService.serviceDetails?.level || "beginner",
  lessonCount: existingService.serviceDetails?.lessonCount || 0,
  duration: existingService.serviceDetails?.duration || {},
  whatYouWillLearn: existingService.serviceDetails?.whatYouWillLearn || [],
  eligibleFor: existingService.serviceDetails?.eligibleFor || [],
  courseCurriculum: existingService.serviceDetails?.courseCurriculum || [],
  courseIncludes: existingService.serviceDetails?.courseIncludes || [],
  certificateImage: existingService.serviceDetails?.certificateImage || [],
  whomToSell: existingService.serviceDetails?.whomToSell || [],
  include: existingService.serviceDetails?.include || [],
  notInclude: existingService.serviceDetails?.notInclude || [],
  safetyAndAssurance: existingService.serviceDetails?.safetyAndAssurance || [],
    };

    // --- Highlights ---
// --- Highlights ---
const highlightUpdated = Array.from(formData.keys()).some((key) =>
  key.startsWith("serviceDetails[highlight]")
);

if (highlightUpdated) {
  const highlights: string[] = [];

  for (const key of formData.keys()) {
    if (key.startsWith("serviceDetails[highlight]")) {
      const value = formData.get(key);

      // ✅ New file upload
      if (
        value &&
        typeof value === "object" &&
        "size" in value &&
        value.size > 0
      ) {
        const url = await handleFileUpload(value, "/services/highlight");
        if (url) highlights.push(url);
      }

      // ✅ Existing URL (edit case)
      else if (typeof value === "string" && value.startsWith("http")) {
        highlights.push(value);
      }
    }
  }

  serviceDetails.highlight = highlights;
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

      for (let i = 0; i < 6; i++) {
        const title = formData.get(`serviceDetails[${field}][${i}][title]`) as string;
        if (!title) break;
        const description = formData.get(`serviceDetails[${field}][${i}][description]`) as string;
        const mediaFile = formData.get(`serviceDetails[${field}][${i}][${mediaKey}]`);

        let url = "";
       if (mediaFile && typeof mediaFile === 'object' && 'size' in mediaFile && mediaFile.size > 0) {
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
      for (let i = 0; i < 6; i++) {
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
const timeRequiredUpdated = formData.has("serviceDetails[timeRequired][0][range]"); 
if (timeRequiredUpdated) {
  serviceDetails.timeRequired = [];
  for (let i = 0; i < 6; i++) {
    const range = formData.get(`serviceDetails[timeRequired][${i}][range]`) as string;
if (!range || range.trim() === "") break;
    serviceDetails.timeRequired.push({
      range: range.trim(),
      parameters: (formData.get(`serviceDetails[timeRequired][${i}][parameters]`) as string)?.trim() || "", // Changed from maxDays
    });
  }
}

    // --- FAQ ---
    const faqUpdated = formData.has("serviceDetails[faq][0][question]");
    if (faqUpdated) {
      serviceDetails.faq = [];
      for (let i = 0; i < 6; i++) {
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
      for (let i = 0; i < 6; i++) {
        const name = formData.get(`serviceDetails[packages][${i}][name]`) as string;
        if (!name) break;
        const pkg: any = {
          name: name.trim(),
          price: Number(formData.get(`serviceDetails[packages][${i}][price]`) || 0),
          discount: Number(formData.get(`serviceDetails[packages][${i}][discount]`) || 0),
          discountedPrice: Number(formData.get(`serviceDetails[packages][${i}][discountedPrice]`) || 0),
          whatYouGet: [],
        };
        for (let j = 0; j < 6; j++) {
          const item = formData.get(`serviceDetails[packages][${i}][whatYouGet][${j}]`) as string;
          if (!item) break;
          pkg.whatYouGet.push(item.trim());
        }
        serviceDetails.packages.push(pkg);
      }
    }

// operatingCities
if (formData.has("serviceDetails[operatingCities][0]")) {
  serviceDetails.operatingCities = [];
  for (let i = 0; i < 50; i++) {
    const city = formData.get(`serviceDetails[operatingCities][${i}]`) as string;
    if (!city || city.trim() === "") break; // ✅ Add trim check
    serviceDetails.operatingCities.push(city.trim());
  }
}

if (Array.from(formData.keys()).some(key => key.startsWith("serviceDetails[brochureImage]"))) {
  serviceDetails.brochureImage = [];
  
  // Method 1: Loop through sequential indices
  for (let i = 0; i < 6; i++) {
    const brochureFile = formData.get(`serviceDetails[brochureImage][${i}]`);
    if (!brochureFile) break;
    
    // Check if it's a file object (new upload)
    if (brochureFile && typeof brochureFile === 'object' && 'size' in brochureFile && brochureFile.size > 0) {
      const url = await handleFileUpload(brochureFile, "/services/brochures");
      if (url) {
        serviceDetails.brochureImage.push(url);
      }
    }
    // Check if it's a string URL (existing image from server)
    else if (typeof brochureFile === 'string' && brochureFile.startsWith('http')) {
      // Keep existing server URLs
      serviceDetails.brochureImage.push(brochureFile);
    }
    // Ignore blob URLs and empty strings
    else if (typeof brochureFile === 'string' && !brochureFile.startsWith('blob:') && brochureFile.trim() !== '') {
      serviceDetails.brochureImage.push(brochureFile);
    }
  }
}

if (Array.from(formData.keys()).some(key => key.startsWith("serviceDetails[certificateImage]"))) {
  const certificateUploadPromises: Promise<string>[] = [];

for (const [key, val] of formData.entries()) {
  if (!key.startsWith("serviceDetails[certificateImage]")) continue;

  if (val && typeof val === "object" && "size" in val && val.size > 0) {
    certificateUploadPromises.push(handleFileUpload(val, "/services/certificates"));
  } else if (typeof val === "string") {
    certificateUploadPromises.push(Promise.resolve(val));
  }
}

serviceDetails.certificateImage = (await Promise.all(certificateUploadPromises)).filter(Boolean);

}
// emiavalable
if (formData.has("serviceDetails[emiavalable][0]")) {
  serviceDetails.emiavalable = [];
  for (let i = 0; i < 6; i++) {
    const emi = formData.get(`serviceDetails[emiavalable][${i}]`) as string;
    if (!emi || emi.trim() === "") break; // ✅ Add trim check
    serviceDetails.emiavalable.push(emi.trim());
  }
}

if (formData.has("serviceDetails[franchiseOperatingModel][0][title]")) {
  serviceDetails.franchiseOperatingModel = [];

  for (let i = 0; i < 6; i++) {
    const title = formData.get(`serviceDetails[franchiseOperatingModel][${i}][title]`) as string;
    const description = formData.get(`serviceDetails[franchiseOperatingModel][${i}][description]`) as string;
    const info = formData.get(`serviceDetails[franchiseOperatingModel][${i}][info]`) as string;
    const example = formData.get(`serviceDetails[franchiseOperatingModel][${i}][example]`) as string;

    if (!title || title.trim() === "") break;

    const features: any[] = [];
    for (let j = 0; j < 6; j++) {
      const subtitle = formData.get(`serviceDetails[franchiseOperatingModel][${i}][features][${j}][subtitle]`) as string;
      const subDescription = formData.get(`serviceDetails[franchiseOperatingModel][${i}][features][${j}][subDescription]`) as string;
       const icon = formData.get(`serviceDetails[franchiseOperatingModel][${i}][features][${j}][icon]`);
 if (!subtitle || subtitle.trim() === "") break;

      let iconUrl = "";

      // ✅ CASE 1: uploaded file
      if (icon && typeof icon === 'object' && 'size' in icon && icon.size > 0) {
        iconUrl = await handleFileUpload(
          icon,
          "/services/franchiseOperatingModel"
        );
      }

      // ✅ CASE 2: already a URL string (terminal / Postman)
      else if (typeof icon === "string" && icon.trim() !== "") {
        iconUrl = icon;
      }
      features.push({
        subtitle: subtitle.trim(),
        subDescription: subDescription?.trim() || "",
        icon: iconUrl,
      });
    }

    const tags: string[] = [];
    for (let j = 0; j < 6; j++) {
      const tag = formData.get(`serviceDetails[franchiseOperatingModel][${i}][tags][${j}]`) as string;
      if (!tag || tag.trim() === "") break;
      tags.push(tag.trim());
    }

    serviceDetails.franchiseOperatingModel.push({
      title: title.trim(),
      description: description?.trim() || "",
      info: info?.trim() || "",
      example: example?.trim() || "",
      features,
      tags
    });
  }
}

if (formData.has("serviceDetails[businessFundamental][description]")) {
  serviceDetails.businessFundamental = {
    description: (formData.get("serviceDetails[businessFundamental][description]") as string)?.trim() || "",
    points: [],
  };

  for (let i = 0; i < 6; i++) {
    const subtitle = formData.get(`serviceDetails[businessFundamental][points][${i}][subtitle]`) as string;
    const subDescription = formData.get(`serviceDetails[businessFundamental][points][${i}][subDescription]`) as string;
    if (!subtitle || subtitle.trim() === "") break;

    serviceDetails.businessFundamental.points.push({
      subtitle: subtitle.trim(),
      subDescription: subDescription?.trim() || "",
    });
  }
}

if (formData.has("serviceDetails[keyAdvantages][0][title]")) {
  serviceDetails.keyAdvantages = [];

  for (let i = 0; i < 6; i++) {
    const title = formData.get(`serviceDetails[keyAdvantages][${i}][title]`) as string;
    const description = formData.get(`serviceDetails[keyAdvantages][${i}][description]`) as string;
   const icon = formData.get(`serviceDetails[keyAdvantages][${i}][icon]`);
    if (!title || title.trim() === "") break;

    let iconUrl = "";
    if (icon && typeof icon === 'object' && 'size' in icon && icon.size > 0) {
      iconUrl = await handleFileUpload(icon, "/services/keyAdvantages");
    }
    else if (typeof icon === "string" && icon.trim() !== "") {
      iconUrl = icon;
    }

    serviceDetails.keyAdvantages.push({
      title: title.trim(),
      description: description?.trim() || "",
      icon: iconUrl,
    });
  }
}

if (formData.has("serviceDetails[completeSupportSystem][0][title]")) {
  serviceDetails.completeSupportSystem = [];

  for (let i = 0; i < 6; i++) {
    const title = formData.get(`serviceDetails[completeSupportSystem][${i}][title]`) as string;
   const icon = formData.get(`serviceDetails[completeSupportSystem][${i}][icon]`);
 if (!title || title.trim() === "") break;

    let iconUrl = "";

    // ✅ CASE 1: icon is a File (browser upload)
    if (icon && typeof icon === 'object' && 'size' in icon && icon.size > 0) {
      iconUrl = await handleFileUpload(
        icon,
        "/services/completeSupportSystem"
      );
    }

    // ✅ CASE 2: icon is already a URL string (terminal / Postman)
    else if (typeof icon === "string" && icon.trim() !== "") {
      iconUrl = icon;
    }

    const lists: string[] = [];

    for (let j = 0; j < 6; j++) {
      const item = formData.get(
        `serviceDetails[completeSupportSystem][${i}][lists][${j}]`
      ) as string;

      if (!item || item.trim() === "") break;
      lists.push(item.trim());
    }

    serviceDetails.completeSupportSystem.push({
      title: title.trim(),
      icon: iconUrl,
      lists
    });
  }
}

["trainingDetails", "agreementDetails", "goodThings", "compareAndChoose"].forEach(field => {
  if (formData.has(`serviceDetails[${field}][0]`)) {
    serviceDetails[field] = [];
    for (let i = 0; i < 50; i++) {
      const val = formData.get(`serviceDetails[${field}][${i}]`) as string;
      if (!val || val.trim() === "") break;
      serviceDetails[field].push(val.trim());
    }
  }
});

if (formData.has("serviceDetails[companyDetails][0][name]")) {
  serviceDetails.companyDetails = [];

  for (let i = 0; i < 6; i++) {
    const name = formData.get(`serviceDetails[companyDetails][${i}][name]`) as string;
    const location = formData.get(`serviceDetails[companyDetails][${i}][location]`) as string;
    if (!name || name.trim() === "") break;

    const profileFile = formData.get(
      `serviceDetails[companyDetails][${i}][profile]`
    );

    let profile = "";

    // ✅ Handle profile upload / reuse
    if (profileFile && typeof profileFile === 'object' && 'size' in profileFile && profileFile.size > 0) {
      try {
        const buffer = Buffer.from(await profileFile.arrayBuffer());
        const upload = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${profileFile.name}`,
          folder: "/services/companyProfiles",
        });
        profile = upload.url;
      } catch (error) {
        console.error(`Failed to upload company profile for index ${i}:`, error);
      }
    } else if (typeof profileFile === "string" && profileFile.trim()) {
      // edit case → already uploaded URL
      profile = profileFile;
    }

    const details: any[] = [];
    for (let j = 0; j < 6; j++) {
      const title = formData.get(`serviceDetails[companyDetails][${i}][details][${j}][title]`) as string;
      const description = formData.get(`serviceDetails[companyDetails][${i}][details][${j}][description]`) as string;
      if (!title || title.trim() === "") break;

      details.push({
        title: title.trim(),
        description: description?.trim() || "",
      });
    }

    serviceDetails.companyDetails.push({
      name: name.trim(),
      location: location?.trim() || "",
      profile,
      details,
    });
  }
}


if (formData.has("serviceDetails[counter][0][number]")) {
  serviceDetails.counter = [];
  for (let i = 0; i < 6; i++) {
    const number = formData.get(`serviceDetails[counter][${i}][number]`) as string;
    const title = formData.get(`serviceDetails[counter][${i}][title]`) as string;

    if (!number || number.trim() === "") break; // ✅ Avoid empty number

    serviceDetails.counter.push({
      number: Number(number),
      title: title?.trim() || "", // ✅ Safe trim
    });
  }
}

// if (formData.has("serviceDetails[businessFundamental][description]")) {
//   serviceDetails.businessFundamental = {
//     description: (formData.get("serviceDetails[businessFundamental][description]") as string)?.trim() || "",
//     points: [],
//   };

//   for (let i = 0; i < 6; i++) {
//     const subtitle = formData.get(`serviceDetails[businessFundamental][points][${i}][subtitle]`) as string;
//     const subDescription = formData.get(`serviceDetails[businessFundamental][points][${i}][subDescription]`) as string;
//     if (!subtitle || subtitle.trim() === "") break;

//     serviceDetails.businessFundamental.points.push({
//       subtitle: subtitle.trim(),
//       subDescription: subDescription?.trim() || "",
//     });
//   }
// }

// ------------------ ROI ------------------
serviceDetails.roi = [];
if (formData.has("serviceDetails[roi][0]")) {
  for (let i = 0; i < 6; i++) {
    const val = formData.get(`serviceDetails[roi][${i}]`) as string;
    if (!val || val.trim() === "") break;
    serviceDetails.roi.push(val.trim());
  }
}

if (formData.has("serviceDetails[level]")) {
  serviceDetails.level = (formData.get("serviceDetails[level]") as string)?.trim() || existingService.level;
}

if (formData.has("serviceDetails[lessonCount]")) {
  serviceDetails.lessonCount = Number(formData.get("serviceDetails[lessonCount]") || existingService.lessonCount);
}

if (formData.has("serviceDetails[duration][weeks]")) {
  serviceDetails.duration = {
    weeks: Number(formData.get("serviceDetails[duration][weeks]") || 0),
    hours: Number(formData.get("serviceDetails[duration][hours]") || 0),
  };
}

// ------------------ What You Will Learn ------------------
serviceDetails.whatYouWillLearn = [];
if (formData.has("serviceDetails[whatYouWillLearn][0]")) {
  for (let i = 0; i < 50; i++) {
    const val = formData.get(`serviceDetails[whatYouWillLearn][${i}]`) as string;
    if (!val || val.trim() === "") break;
    serviceDetails.whatYouWillLearn.push(val.trim());
  }
}

// ------------------ Eligible For ------------------
serviceDetails.eligibleFor = [];
if (formData.has("serviceDetails[eligibleFor][0]")) {
  for (let i = 0; i < 50; i++) {
    const val = formData.get(`serviceDetails[eligibleFor][${i}]`) as string;
    if (!val || val.trim() === "") break;
    serviceDetails.eligibleFor.push(val.trim());
  }
}

// ------------------ Course Curriculum ------------------
serviceDetails.courseCurriculum = [];
if (formData.has("serviceDetails[courseCurriculum][0][title]")) {
  for (let i = 0; i < 6; i++) {
    const title = formData.get(`serviceDetails[courseCurriculum][${i}][title]`) as string;
    if (!title || title.trim() === "") break;

    const lists: string[] = [];
    for (let j = 0; j < 50; j++) {
      const listItem = formData.get(`serviceDetails[courseCurriculum][${i}][lists][${j}]`) as string;
      if (!listItem || listItem.trim() === "") break;
      lists.push(listItem.trim());
    }

    const model: string[] = [];
    for (let j = 0; j < 50; j++) {
      const modelItem = formData.get(`serviceDetails[courseCurriculum][${i}][model][${j}]`) as string;
      if (!modelItem || modelItem.trim() === "") break;
      model.push(modelItem.trim());
    }

    serviceDetails.courseCurriculum.push({
      title: title.trim(),
      lists,
      model,
    });
  }
}

// ------------------ Course Includes ------------------
serviceDetails.courseIncludes = [];
if (formData.has("serviceDetails[courseIncludes][0]")) {
  for (let i = 0; i < 50; i++) {
    const val = formData.get(`serviceDetails[courseIncludes][${i}]`) as string;
    if (!val || val.trim() === "") break;
    serviceDetails.courseIncludes.push(val.trim());
  }
}

// ------------------ Whom To Sell ------------------
serviceDetails.whomToSell = [];

for (let i = 0; i < 6; i++) {
  const list = formData.get(
    `serviceDetails[whomToSell][${i}][lists]`
  )?.toString();

  const icon = formData.get(
    `serviceDetails[whomToSell][${i}][icon]`
  );

  if (!list && !icon) continue;

  serviceDetails.whomToSell.push({
    lists: list || "",
    icon:
      icon && typeof icon === 'object' && 'size' in icon
        ? await handleFileUpload(icon, "/services/whomToSell")
        : icon?.toString() || ""
  });
}



// ------------------ Include ------------------
serviceDetails.include = [];
if (formData.has("serviceDetails[include][0]")) {
  for (let i = 0; i < 50; i++) {
    const val = formData.get(`serviceDetails[include][${i}]`) as string;
    if (!val || val.trim() === "") break;
    serviceDetails.include.push(val.trim());
  }
}

// ------------------ Not Include ------------------
serviceDetails.notInclude = [];
if (formData.has("serviceDetails[notInclude][0]")) {
  for (let i = 0; i < 50; i++) {
    const val = formData.get(`serviceDetails[notInclude][${i}]`) as string;
    if (!val || val.trim() === "") break;
    serviceDetails.notInclude.push(val.trim());
  }
}

// ------------------ Safety And Assurance ------------------
serviceDetails.safetyAndAssurance = [];
if (formData.has("serviceDetails[safetyAndAssurance][0]")) {
  for (let i = 0; i < 50; i++) {
    const val = formData.get(`serviceDetails[safetyAndAssurance][${i}]`) as string;
    if (!val || val.trim() === "") break;
    serviceDetails.safetyAndAssurance.push(val.trim());
  }
} 

// certificateImage
if (Array.from(formData.keys()).some(k => k.startsWith("serviceDetails[certificateImage]"))) {
  serviceDetails.certificateImage = [];

  for (const [key, val] of formData.entries()) {
    if (!key.startsWith("serviceDetails[certificateImage]")) continue;

    if (val && typeof val === 'object' && 'size' in val && val.size > 0) {
      
      serviceDetails.certificateImage.push(
        await handleFileUpload(val, "/services/certificates")
      );
    } else if (typeof val === "string") {
      serviceDetails.certificateImage.push(val);
    }
  }
}

// -----------------------------------------------------------------------
const serviceExtraImagesUpdated = Array.from(formData.keys()).some((key) =>
  key.startsWith("franchiseDetails[extraImages]")
);

if (serviceExtraImagesUpdated) {
  serviceDetails.extraImages = [];

  for (const key of formData.keys()) {
    if (key.startsWith("serviceDetails[extraImages]")) {
      const value = formData.get(key);

      // Case 1: New file upload
      if (value && typeof value === 'object' && 'size' in value && value.size > 0) {
        const uploadedUrl = await handleFileUpload(
          value,
          "/services/franchise/extraImages"
        );
        serviceDetails.extraImages.push(uploadedUrl);
      }
      // Case 2: Existing image URL
      else if (typeof value === "string" && value.trim() !== "") {
        serviceDetails.extraImages.push(value);
      }
    }
  }
}
// -----------------------------------------------------------------------
    // --- Extra Images ---
  const extraImagesUpdated = Array.from(formData.keys()).some(key =>
  key.startsWith("serviceDetails[extraSections]")
);

if (extraImagesUpdated) {
  serviceDetails.extraSections = serviceDetails.extraSections || [];

  const extraSectionPromises: Promise<void>[] = [];

for (const [key, value] of formData.entries()) {
  const match = key.match(/serviceDetails\[extraSections]\[(\d+)]\[image]\[(\d+)]/);
  if (!match) continue;

  const sectionIndex = Number(match[1]);
  const imageIndex = Number(match[2]);

  if (!serviceDetails.extraSections[sectionIndex]) {
    serviceDetails.extraSections[sectionIndex] = { image: [] };
  }
  serviceDetails.extraSections[sectionIndex].image = serviceDetails.extraSections[sectionIndex].image || [];

  if (value && typeof value === "object" && "size" in value && value.size > 0) {
    extraSectionPromises.push(
      handleFileUpload(value, "/services/extraSections").then((url) => {
        serviceDetails.extraSections[sectionIndex].image[imageIndex] = url;
      })
    );
  } else if (typeof value === "string" && value.trim() !== "") {
    serviceDetails.extraSections[sectionIndex].image[imageIndex] = value.trim();
  }
}

await Promise.all(extraSectionPromises);

}

    // --- Extra Sections ---
    const extraSectionsUpdated = formData.has("serviceDetails[extraSections][0][title]");
    if (extraSectionsUpdated) {
      serviceDetails.extraSections = [];
      for (let i = 0; i < 6; i++) {
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
        for (let j = 0; j < 6; j++) {
          const subtitle = formData.get(`serviceDetails[extraSections][${i}][subtitle][${j}]`) as string;
          if (!subtitle) break;
          extraSection.subtitle.push(subtitle.trim());
        }

        // Process description array
        for (let j = 0; j < 6; j++) {
          const description = formData.get(`serviceDetails[extraSections][${i}][description][${j}]`) as string;
          if (!description) break;
          extraSection.description.push(description.trim());
        }

        // Process subDescription array
        for (let j = 0; j < 6; j++) {
          const subDescription = formData.get(
            `serviceDetails[extraSections][${i}][subDescription][${j}]`
          ) as string;
          if (!subDescription) break;
          extraSection.subDescription.push(subDescription.trim());
        }

        // Process lists array
        for (let j = 0; j < 6; j++) {
          const list = formData.get(`serviceDetails[extraSections][${i}][lists][${j}]`) as string;
          if (!list) break;
          extraSection.lists.push(list.trim());
        }

        // Process tags array
        for (let j = 0; j < 6; j++) {
          const tag = formData.get(`serviceDetails[extraSections][${i}][tags][${j}]`) as string;
          if (!tag) break;
          extraSection.tags.push(tag.trim());
        }

        // Process image array
for (let j = 0; j < 6; j++) {
  const imageValue = formData.get(
    `serviceDetails[extraSections][${i}][image][${j}]`
  );

  if (!imageValue) break;

  // ✅ New upload
  if (imageValue && typeof imageValue === 'object' && 'size' in imageValue && imageValue.size > 0) {
    const url = await handleFileUpload(imageValue, "/services/extraSections");
    extraSection.image.push(url);
  }

  // ✅ Existing image URL
  else if (typeof imageValue === "string" && imageValue.trim() !== "") {
    extraSection.image.push(imageValue.trim());
  }
}


        serviceDetails.extraSections.push(extraSection);
      }
    }

    // --- Franchise Details --- (Fixed duplicate declaration)
    const getStringOrExisting = (
  key: string,
  existing?: string
) => {
  if (!formData.has(key)) return existing;
  const val = (formData.get(key) as string)?.trim();
  return val ? val : existing;
};

    const franchiseDetails: any = {
commission: getStringOrExisting(
    "franchiseDetails[commission]",
    existingService.franchiseDetails?.commission
  ),
      termsAndConditions: formData.has("franchiseDetails[termsAndConditions]")
        ? (formData.get("franchiseDetails[termsAndConditions]") as string)
        : existingService.franchiseDetails?.termsAndConditions,
      investmentRange: existingService.franchiseDetails?.investmentRange || [],
      monthlyEarnPotential: existingService.franchiseDetails?.monthlyEarnPotential || [],
      franchiseModel: existingService.franchiseDetails?.franchiseModel || [],
      areaRequired : formData.get("franchiseDetails[areaRequired]"),
      extraSections: existingService.franchiseDetails?.extraSections || [],
      extraImages: existingService.franchiseDetails?.extraImages || [],
    };

    // --- Investment Range ---
const investmentRangeUpdated = formData.has("franchiseDetails[investmentRange][0][range]"); // Changed from minRange
if (investmentRangeUpdated) {
  franchiseDetails.investmentRange = [];
  for (let i = 0; i < 6; i++) {
    const range = formData.get(`franchiseDetails[investmentRange][${i}][range]`) as string;
    if (!range) break;
    franchiseDetails.investmentRange.push({
      range: range.trim(),
      parameters: (formData.get(`franchiseDetails[investmentRange][${i}][parameters]`) as string)?.trim() || "", // Changed from maxRange
    });
  }
}

    // --- Monthly Earn Potential ---
const monthlyEarnUpdated = formData.has("franchiseDetails[monthlyEarnPotential][0][range]"); // Changed from minEarn
if (monthlyEarnUpdated) {
  franchiseDetails.monthlyEarnPotential = [];
  for (let i = 0; i < 6; i++) {
    const range = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][range]`) as string;
    if (!range) break;
    franchiseDetails.monthlyEarnPotential.push({
      range: range.trim(),
      parameters: (formData.get(`franchiseDetails[monthlyEarnPotential][${i}][parameters]`) as string)?.trim() || "", // Changed from maxEarn
    });
  }
}

    // --- Franchise Model ---
    const franchiseModelUpdated = formData.has("franchiseDetails[franchiseModel][0][title]");
    if (franchiseModelUpdated) {
      franchiseDetails.franchiseModel = [];
      for (let i = 0; i < 6; i++) {
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
      const value = formData.get(key);

      // Case 1: New file upload
      if (value && typeof value === 'object' && 'size' in value && value.size > 0) {
        const uploadedUrl = await handleFileUpload(
          value,
          "/services/franchise/extraImages"
        );
        franchiseDetails.extraImages.push(uploadedUrl);
      }
      // Case 2: Existing image URL
      else if (typeof value === "string" && value.trim() !== "") {
        franchiseDetails.extraImages.push(value);
      }
    }
  }
}


    // --- Extra Sections in Franchise Details ---
    const franchiseExtraSectionsUpdated = formData.has("franchiseDetails[extraSections][0][title]");
    if (franchiseExtraSectionsUpdated) {
      franchiseDetails.extraSections = [];
      for (let i = 0; i < 6; i++) {
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
for (let j = 0; j < 6; j++) {
  const val = formData.get(
    `franchiseDetails[extraSections][${i}][subtitle][${j}]`
  ) as string;
  if (!val) break;
  extraSection.subtitle.push(val.trim());
}

// --- description ---
for (let j = 0; j < 6; j++) {
  const description = formData.get(
    `franchiseDetails[extraSections][${i}][description][${j}]`
  ) as string;

  if (!description) break;
  extraSection.description.push(description.trim());
}

// --- subDescription ---
for (let j = 0; j < 6; j++) {
  const subDescription = formData.get(
    `franchiseDetails[extraSections][${i}][subDescription][${j}]`
  ) as string;

  if (!subDescription) break;
  extraSection.subDescription.push(subDescription.trim());
}

// --- lists ---
for (let j = 0; j < 6; j++) {
  const list = formData.get(
    `franchiseDetails[extraSections][${i}][lists][${j}]`
  ) as string;

  if (!list) break;
  extraSection.lists.push(list.trim());
}

// --- tags ---
for (let j = 0; j < 6; j++) {
  const tag = formData.get(
    `franchiseDetails[extraSections][${i}][tags][${j}]`
  ) as string;

  if (!tag) break;
  extraSection.tags.push(tag.trim());
}

// --- images ---
for (let j = 0; j < 6; j++) {
  const imageVal = formData.get(
    `franchiseDetails[extraSections][${i}][image][${j}]`
  );

  if (!imageVal) break;

  // Case 1: New file upload
  if (imageVal && typeof imageVal === 'object' && 'size' in imageVal && imageVal.size > 0) {
    const url = await handleFileUpload(
      imageVal,
      "/services/franchise/extraSections"
    );
    extraSection.image.push(url);
  }

  // Case 2: Existing image URL (string)
  else if (typeof imageVal === "string") {
    extraSection.image.push(imageVal);
  }
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



