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
export async function PUT(req: NextRequest) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); 

    console.log("id : ", id)

    if (!id) {
      return NextResponse.json({ success: false, message: "Service ID is required" }, { status: 400, headers: corsHeaders });
    }

    const service = await Service.findById(id);
    if (!service) {
      return NextResponse.json({ success: false, message: "Service not found" }, { status: 404, headers: corsHeaders });
    }

    const formData = await req.formData();

    console.log("service backend data : ", formData);

    // -------------------------------
    // BASIC DETAILS
    // -------------------------------
    service.serviceName = formData.get("serviceName") as string || service.serviceName;
    service.category = formData.get("category") as string || service.category;
    service.subcategory = formData.get("subcategory") as string || service.subcategory;
    service.price = Number(formData.get("price")) || service.price;
    service.discount = Number(formData.get("discount") || 0);
    service.gst = Number(formData.get("gst") || 0);
    service.includeGst = formData.get("includeGst") === "true";

    service.recommendedServices = formData.get("recommendedServices") === "true";
    const tags: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("tags[")) {
        const val = formData.get(key) as string;
        if (val) tags.push(val);
      }
    }
    service.tags = tags;

    // -------------------------------
    // KEY VALUES
    // -------------------------------
    const keyValues: any[] = [];
    for (let i = 0; ; i++) {
      const key = formData.get(`keyValues[${i}][key]`);
      const value = formData.get(`keyValues[${i}][value]`);
      if (!key || !value) break;
      keyValues.push({ key, value });
    }
    service.keyValues = keyValues;

    // -------------------------------
    // THUMBNAIL IMAGE UPLOAD
    // -------------------------------
    const thumbnailFile = formData.get("thumbnailImage") as File;
    if (thumbnailFile) {
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const upload = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${thumbnailFile.name}`,
        folder: "/services/thumbnail",
      });
      service.thumbnailImage = upload.url;
    }

    // -------------------------------
    // BANNER IMAGES
    // -------------------------------
    const bannerImages: string[] = [];
    for (const [key, val] of formData.entries()) {
      if (key.startsWith("bannerImages") && val instanceof File) {
        const buffer = Buffer.from(await val.arrayBuffer());
        const upload = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${val.name}`,
          folder: "/services/banners",
        });
        bannerImages.push(upload.url);
      }
    }
    if (bannerImages.length) service.bannerImages = bannerImages;

    // -------------------------------
    // PROVIDER PRICES
    // -------------------------------
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
    if (providerPrices.length) service.providerPrices = providerPrices;

    // -------------------------------
    // SERVICE DETAILS
    // -------------------------------
    const serviceDetails = { ...service.serviceDetails }; // clone existing
    const arrayOfStringFields = ["benefits", "aboutUs", "document", "termsAndConditions", "extraImages", "highlight"];

    arrayOfStringFields.forEach((field) => {
      const arr: string[] = [];
      for (const key of formData.keys()) {
        if (key.startsWith(`serviceDetails[${field}]`)) {
          const val = formData.get(key) as string;
          if (val) arr.push(val);
        }
      }
      if (arr.length) serviceDetails[field] = arr;
    });

    // FAQ
    const faq: any[] = [];
    for (let i = 0; ; i++) {
      const question = formData.get(`serviceDetails[faq][${i}][question]`);
      const answer = formData.get(`serviceDetails[faq][${i}][answer]`);
      if (!question || !answer) break;
      faq.push({ question, answer });
    }
    if (faq.length) serviceDetails.faq = faq;

    // Extra Sections
    const extraSections: any[] = [];
    for (let i = 0; ; i++) {
      const title = formData.get(`serviceDetails[extraSections][${i}][title]`);
      if (!title) break;

      const section: any = { title, subtitle: [], image: [], description: [], subDescription: [], lists: [], tags: [] };

      ["subtitle", "description", "subDescription", "lists", "tags"].forEach((field) => {
        const arr: string[] = [];
        for (const key of formData.keys()) {
          if (key.startsWith(`serviceDetails[extraSections][${i}][${field}]`)) {
            const val = formData.get(key) as string;
            if (val) arr.push(val);
          }
        }
        section[field] = arr;
      });

      for (const [key, value] of formData.entries()) {
        if (key.startsWith(`serviceDetails[extraSections][${i}][image]`) && value instanceof File) {
          const buffer = Buffer.from(await value.arrayBuffer());
          const upload = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${value.name}`,
            folder: "/services/extras",
          });
          section.image.push(upload.url);
        }
      }

      extraSections.push(section);
    }
    if (extraSections.length) serviceDetails.extraSections = extraSections;

    service.serviceDetails = serviceDetails;

    // -------------------------------
    // FRANCHISE DETAILS
    // -------------------------------
    const franchiseDetails = { ...service.franchiseDetails }; // clone
    franchiseDetails.commission = formData.get("franchiseDetails[commission]") || franchiseDetails.commission;
    franchiseDetails.termsAndConditions = formData.get("franchiseDetails[termsAndConditions]") || franchiseDetails.termsAndConditions;

    // Investment Range
    const investmentRange: any[] = [];
    for (let i = 0; ; i++) {
      const minRange = formData.get(`franchiseDetails[investmentRange][${i}][minRange]`);
      const maxRange = formData.get(`franchiseDetails[investmentRange][${i}][maxRange]`);
      if (!minRange || !maxRange) break;
      investmentRange.push({ minRange, maxRange });
    }
    if (investmentRange.length) franchiseDetails.investmentRange = investmentRange;

    // Monthly Earn Potential
    const monthlyEarnPotential: any[] = [];
    for (let i = 0; ; i++) {
      const minEarn = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][minEarn]`);
      const maxEarn = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][maxEarn]`);
      if (!minEarn || !maxEarn) break;
      monthlyEarnPotential.push({ minEarn, maxEarn });
    }
    if (monthlyEarnPotential.length) franchiseDetails.monthlyEarnPotential = monthlyEarnPotential;

    // Franchise Model
    const franchiseModel: any[] = [];
    for (let i = 0; ; i++) {
      const title = formData.get(`franchiseDetails[franchiseModel][${i}][title]`);
      if (!title) break;
      franchiseModel.push({
        title,
        agreement: formData.get(`franchiseDetails[franchiseModel][${i}][agreement]`),
        price: formData.get(`franchiseDetails[franchiseModel][${i}][price]`),
        discount: formData.get(`franchiseDetails[franchiseModel][${i}][discount]`),
        gst: formData.get(`franchiseDetails[franchiseModel][${i}][gst]`),
        fees: formData.get(`franchiseDetails[franchiseModel][${i}][fees]`),
      });
    }
    if (franchiseModel.length) franchiseDetails.franchiseModel = franchiseModel;

    service.franchiseDetails = franchiseDetails;

    // -------------------------------
    // FINAL CALCULATIONS
    // -------------------------------
    const discountedPrice = service.discount
      ? Math.floor(service.price - service.price * (service.discount / 100))
      : service.price;
    const gstInRupees = (discountedPrice * service.gst) / 100;
    const totalWithGst = discountedPrice + gstInRupees;

    service.discountedPrice = discountedPrice;
    service.gstInRupees = gstInRupees;
    service.totalWithGst = totalWithGst;

    // -------------------------------
    // SAVE
    // -------------------------------
    await service.save();

    return NextResponse.json({ success: true, data: service }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers: corsHeaders });
  }
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
