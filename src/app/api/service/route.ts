import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import "@/models/Category";
import "@/models/Subcategory";
import "@/models/Provider";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Node-safe file upload helper
async function handleFileUpload(fileOrBlob: any, folder: string, prefix: string) {
  if (!fileOrBlob) return "";

  // If fileOrBlob has arrayBuffer (File/Blob)
  if (typeof fileOrBlob.arrayBuffer === "function") {
    const buffer = Buffer.from(await fileOrBlob.arrayBuffer());
    const upload = await imagekit.upload({
      file: buffer,
      fileName: `${uuidv4()}-${prefix}`,
      folder,
    });
    return upload.url;
  }

  // If string blob URL from client
  if (typeof fileOrBlob === "string" && fileOrBlob.startsWith("blob:")) {
    const res = await fetch(fileOrBlob);
    const blobBuffer = Buffer.from(await res.arrayBuffer());
    const upload = await imagekit.upload({
      file: blobBuffer,
      fileName: `${uuidv4()}-${prefix}.png`,
      folder,
    });
    return upload.url;
  }

  // If already a string URL, just return
  if (typeof fileOrBlob === "string") return fileOrBlob;

  return "";
}

// Section processor for title + description + optional icon/image
async function processSectionWithIcon(
  formData: FormData,
  fieldName: string,
  folder: string,
  mediaKey: "icon" | "image"
) {
  const arr: any[] = [];
  for (let i = 0; ; i++) {
    const title = formData.get(`serviceDetails[${fieldName}][${i}][title]`);
    if (!title) break;
    const description = formData.get(`serviceDetails[${fieldName}][${i}][description]`);
    const iconOrImage = formData.get(`serviceDetails[${fieldName}][${i}][icon]`) 
                     || formData.get(`serviceDetails[${fieldName}][${i}][image]`);
    const uploadedURL = await handleFileUpload(iconOrImage, folder, `${fieldName}-${i}`);
    arr.push({ title, description, [mediaKey]: uploadedURL });
  }
  return arr;
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    const serviceName = formData.get("serviceName") as string;
    const category = (formData.get("category") as string) || "";

    if (!serviceName?.trim()) return NextResponse.json({ success: false, message: "Service name is required" }, { status: 400, headers: corsHeaders });
    if (!category?.trim()) return NextResponse.json({ success: false, message: "Category is required" }, { status: 400, headers: corsHeaders });

    const subcategory = formData.get("subcategory") as string | null;
    const subcategoryId = subcategory?.trim() || null;

    const price = Number(formData.get("price"));
    const discount = Number(formData.get("discount") || 0);
    const gst = Number(formData.get("gst") || 0);
    const includeGst = formData.get("includeGst") === "true";
    const recommendedServices = formData.get("recommendedServices") === "true";

    // Tags
    const tags: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("tags[")) {
        const val = formData.get(key) as string;
        if (val) tags.push(val);
      }
    }

    // KeyValues
    const keyValues: any[] = [];
    for (let i = 0; ; i++) {
      const key = formData.get(`keyValues[${i}][key]`);
      const value = formData.get(`keyValues[${i}][value]`);
      if (!key || !value) break;
      keyValues.push({ key, value });
    }

    // Thumbnail
    const thumbnailFile = formData.get("thumbnail");
    const thumbnailImage = await handleFileUpload(thumbnailFile, "/services/thumbnail", thumbnailFile?.name || "thumbnail");

    // Banner Images
    const bannerImages: string[] = [];
    for (const [key, val] of formData.entries()) {
      if (key.startsWith("bannerImages") && val) {
        const url = await handleFileUpload(val, "/services/banners", `${uuidv4()}-banner`);
        bannerImages.push(url);
      }
    }

    // Provider Prices
    const providerPrices: any[] = [];
    for (let i = 0; ; i++) {
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

    // Service Details
    const serviceDetails: any = {
      benefits: JSON.parse((formData.get("serviceDetails[benefits]") as string) || "[]"),
      aboutUs: JSON.parse((formData.get("serviceDetails[aboutUs]") as string) || "[]"),
      document: JSON.parse((formData.get("serviceDetails[document]") as string) || "[]"),
      termsAndConditions: formData.get("serviceDetails[termsAndConditions]") || "",
      faq: [],
      highlight: [],
      assuredByFetchTrue: [],
      howItWorks: [],
      whyChooseUs: [],
      weRequired: [],
      weDeliver: [],
      moreInfo: [],
      connectWith: [],
      timeRequired: [],
      packages: [],
      extraSections: [],
      extraImages: [],
    };

    // Sections with icon/image
    serviceDetails.assuredByFetchTrue = await processSectionWithIcon(formData, "assuredByFetchTrue", "/services/assuredIcons", "icon");
    serviceDetails.howItWorks = await processSectionWithIcon(formData, "howItWorks", "/services/howItWorks", "icon");
    serviceDetails.whyChooseUs = await processSectionWithIcon(formData, "whyChooseUs", "/services/whyChooseUs", "icon");
    serviceDetails.weRequired = await processSectionWithIcon(formData, "weRequired", "/services/weRequired", "icon");
    serviceDetails.weDeliver = await processSectionWithIcon(formData, "weDeliver", "/services/weDeliver", "icon");
    serviceDetails.moreInfo = await processSectionWithIcon(formData, "moreInfo", "/services/moreInfo", "image");

    // Highlight images
    for (const [key, val] of formData.entries()) {
      if (key.startsWith("serviceDetails[highlight]") && val) {
        const url = await handleFileUpload(val, "/services/highlight", `${uuidv4()}-highlight`);
        serviceDetails.highlight.push(url);
      }
    }

    // Extra Images
    for (const [key, val] of formData.entries()) {
      if (key.startsWith("serviceDetails[extraImages]") && val) {
        const url = await handleFileUpload(val, "/services/extras/images", `${uuidv4()}-extra`);
        serviceDetails.extraImages.push(url);
      }
    }

    // Packages
    for (let i = 0; ; i++) {
      const name = formData.get(`serviceDetails[packages][${i}][name]`);
      if (!name) break;
      const pkg: any = {
        name,
        price: formData.get(`serviceDetails[packages][${i}][price]`),
        discount: formData.get(`serviceDetails[packages][${i}][discount]`),
        discountedPrice: formData.get(`serviceDetails[packages][${i}][discountedPrice]`),
        whatYouGet: [],
      };
      for (let j = 0; ; j++) {
        const item = formData.get(`serviceDetails[packages][${i}][whatYouGet][${j}]`);
        if (!item) break;
        pkg.whatYouGet.push(item);
      }
      serviceDetails.packages.push(pkg);
    }

    // Connect With
    for (let i = 0; ; i++) {
      const name = formData.get(`serviceDetails[connectWith][${i}][name]`);
      if (!name) break;
      serviceDetails.connectWith.push({
        name,
        mobileNo: formData.get(`serviceDetails[connectWith][${i}][mobileNo]`),
        email: formData.get(`serviceDetails[connectWith][${i}][email]`),
      });
    }

    // Time Required
    for (let i = 0; ; i++) {
      const minDays = formData.get(`serviceDetails[timeRequired][${i}][minDays]`);
      if (!minDays) break;
      serviceDetails.timeRequired.push({ minDays, maxDays: formData.get(`serviceDetails[timeRequired][${i}][maxDays]`) });
    }

    // Discount & GST
    const discountedPrice = discount ? Math.floor(price - price * (discount / 100)) : price;
    const gstInRupees = (discountedPrice * gst) / 100;
    const totalWithGst = discountedPrice + gstInRupees;

    // Save to DB
    const newService = await Service.create({
      serviceName: serviceName.trim(),
      category,
      subcategory: subcategoryId,
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
      isDeleted: false,
      recommendedServices,
    });

    return NextResponse.json({ success: true, data: newService }, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    console.log("🔥 API ERROR:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: corsHeaders });
  }
}
