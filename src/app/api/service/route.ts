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

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    // QUICK REQUIRED FIELD CHECK (fail fast BEFORE heavy work)
    const serviceName = (formData.get("serviceName") as string) || "";
    const category = (formData.get("category") as string) || "";

    if (!serviceName || serviceName.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Service name is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!category || category.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Category is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Continue parsing other fields (use the already-obtained serviceName & category)
    const subcategory = formData.get("subcategory") as string | null;
const subcategoryId = subcategory && subcategory.trim() !== "" ? subcategory : null;
    const price = Number(formData.get("price") || 0);
    const discount = Number(formData.get("discount") || 0);
    const gst = Number(formData.get("gst") || 0);
    const includeGst = formData.get("includeGst") === "true";
    const recommendedServices = formData.get("recommendedServices") === "true";

    // tags
    const tags: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("tags[")) {
        const val = formData.get(key) as string;
        if (val) tags.push(val);
      }
    }

    // keyValues (same loop you had)
    const keyValues: any[] = [];
    for (let i = 0; ; i++) {
      const key = formData.get(`keyValues[${i}][key]`);
      const value = formData.get(`keyValues[${i}][value]`);
      if (!key || !value) break;
      keyValues.push({ key, value });
    }

    // ========== Image / file uploads and rest of processing ==========

    let thumbnailImage = "";
    const thumbnailFile = formData.get("thumbnail") as File | null;

    if (thumbnailFile && thumbnailFile instanceof File) {
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const upload = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${thumbnailFile.name}`,
        folder: "/services/thumbnail",
      });
      thumbnailImage = upload.url;
    }

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

    // providerPrices (your existing loop)
    const providerPrices: any[] = [];
    for (let i = 0; ; i++) {
      const provider = formData.get(`providerPrices[${i}][provider]`);
      if (!provider) break;
      providerPrices.push({
        provider,
        providerMRP: formData.get(`providerPrices[${i}][providerMRP]`),
        providerDiscount: formData.get(
          `providerPrices[${i}][providerDiscount]`
        ),
        providerPrice: formData.get(`providerPrices[${i}][providerPrice]`),
        providerCommission: formData.get(
          `providerPrices[${i}][providerCommission]`
        ),
        status: formData.get(`providerPrices[${i}][status]`),
      });
    }

    // BUILD serviceDetails and franchiseDetails (use your existing logic)
    const serviceDetails: any = {
      benefits: [],
      aboutUs: [],
      highlight: [],
      document: [],
      assuredByFetchTrue: [],
      howItWorks: [],
      termsAndConditions: [],
      faq: [],
      extraSections: [],
      whyChooseUs: [],
      packages: [],
      weRequired: [],
      weDeliver: [],
      moreInfo: [],
      connectWith: [],
      timeRequired: [],
      extraImages: [],
    };

    // ... (insert the rest of your serviceDetails and franchiseDetails processing code here)
    // For brevity, reuse the exact processing code you already have for:
    // - handleFileUpload, processSectionWithIcon, packages loop, faq loop,
    // - extraImages, extraSections, franchiseDetails loops, etc.

    // after you computed discount + gst logic
    const discountedPrice = discount
      ? Math.floor(price - price * (discount / 100))
      : price;

    const gstInRupees = (discountedPrice * gst) / 100;
    const totalWithGst = discountedPrice + gstInRupees;

    const newService = await Service.create({
      serviceName: serviceName.trim(),
      category,
       subcategory: subcategoryId  ,
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
      // include franchiseDetails too (your computed object)
      franchiseDetails: {}, // replace with your computed franchiseDetails object
      isDeleted: false,
      recommendedServices,
    });

    return NextResponse.json(
      { success: true, data: newService },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("🔥 API ERROR:", error);

    // If it's a Mongoose validation error, return 400 and field messages
    if (error.name === "ValidationError") {
      // build a single message or field-level messages
      const messages = Object.values(error.errors || {}).map(
        (err: any) => err.message
      );
      const message = messages.join(", ") || "Validation failed";
      return NextResponse.json(
        { success: false, message },
        { status: 400, headers: corsHeaders }
      );
    }

    // default 500
    return NextResponse.json(
      { success: false, message: error.message || "Unknown server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
