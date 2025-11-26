import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import "@/models/Category"
import "@/models/Subcategory"
import "@/models/Provider"
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
   

     console.log("=== FormData Entries ===");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, "=>", value.name, value.size, value.type);
      } else {
        console.log(key, "=>", value);
      }
    }
    console.log("=======================");
    // -------------------------------
    // BASIC DETAILS
    // -------------------------------
    const serviceName = formData.get("serviceName") as string;
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;

    const price = Number(formData.get("price"));
    const discount = Number(formData.get("discount") || 0);
    const gst = Number(formData.get("gst") || 0);
    const includeGst = formData.get("includeGst") === "true";

    const recommendedServices = formData.get("recommendedServices") === "true";
    // -----------------------------------
    // TAGS
    // -----------------------------------
    const tags: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("tags[")) {
        const val = formData.get(key) as string;
        if (val) tags.push(val);
      }
    }

    // -----------------------------------
    // KEY VALUES
    // -----------------------------------
    const keyValues: any[] = [];
    for (let i = 0; ; i++) {
      const key = formData.get(`keyValues[${i}][key]`);
      const value = formData.get(`keyValues[${i}][value]`);

      if (!key || !value) break;
      keyValues.push({ key, value });
    }

    // -----------------------------------
    // THUMBNAIL IMAGE UPLOAD
    // -----------------------------------
    let thumbnailImage = "";
    const thumbnailFile = formData.get("thumbnailImage") as File;

    if (thumbnailFile) {
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const upload = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${thumbnailFile.name}`,
        folder: "/services/thumbnail",
      });
      thumbnailImage = upload.url;
    }

    // -----------------------------------
    // BANNER IMAGES
    // -----------------------------------
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

    // -----------------------------------
    // PROVIDER PRICES
    // -----------------------------------
    const providerPrices: any[] = [];
    for (let i = 0; ; i++) {
      const provider = formData.get(`providerPrices[${i}][provider]`);
      const providerMRP = formData.get(`providerPrices[${i}][providerMRP]`);
      const providerDiscount = formData.get(
        `providerPrices[${i}][providerDiscount]`
      );
      const providerPrice = formData.get(`providerPrices[${i}][providerPrice]`);
      const providerCommission = formData.get(
        `providerPrices[${i}][providerCommission]`
      );
      const status = formData.get(`providerPrices[${i}][status]`);

      if (!provider) break;

      providerPrices.push({
        provider,
        providerMRP,
        providerDiscount,
        providerPrice,
        providerCommission,
        status,
      });
    }

    // -----------------------------------
    // SERVICE DETAILS
    // -----------------------------------
    const serviceDetails = {
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

    const arrayOfStringFields = [
      "benefits",
      "aboutUs",
      "document",
      "termsAndConditions",
      "extraImages",
      "highlight",
    ];

    arrayOfStringFields.forEach((field) => {
      const arr: string[] = [];
      for (const key of formData.keys()) {
        if (key.startsWith(`serviceDetails[${field}]`)) {
          const val = formData.get(key) as string;
          if (val) arr.push(val);
        }
      }
      serviceDetails[field] = arr;
    });

    // Upload highlight images
    const highlightImages: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("serviceDetails[highlightImages]") && value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());
        const upload = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${value.name}`,
          folder: "/services/highlight",
        });
        highlightImages.push(upload.url);
      }
    }
    serviceDetails.highlight = highlightImages;

    // Faq
    for (let i = 0; ; i++) {
      const question = formData.get(`serviceDetails[faq][${i}][question]`);
      const answer = formData.get(`serviceDetails[faq][${i}][answer]`);
      if (!question || !answer) break;
      serviceDetails.faq.push({ question, answer });
    }

    // Extra Sections
    for (let i = 0; ; i++) {
      const title = formData.get(`serviceDetails[extraSections][${i}][title]`);
      if (!title) break;

      const section: any = { title, subtitle: [], image: [], description: [], subDescription: [], lists: [], tags: [] };

      ["subtitle", "description", "subDescription", "lists", "tags"].forEach(
        (field) => {
          const arr: string[] = [];
          for (const key of formData.keys()) {
            if (
              key.startsWith(
                `serviceDetails[extraSections][${i}][${field}]`
              )
            ) {
              const val = formData.get(key) as string;
              if (val) arr.push(val);
            }
          }
          section[field] = arr;
        }
      );

      // extraSections images upload
      for (const [key, value] of formData.entries()) {
        if (
          key.startsWith(
            `serviceDetails[extraSections][${i}][image]`
          ) &&
          value instanceof File
        ) {
          const buffer = Buffer.from(await value.arrayBuffer());
          const upload = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${value.name}`,
            folder: "/services/extras",
          });
          section.image.push(upload.url);
        }
      }

      serviceDetails.extraSections.push(section);
    }

    // -----------------------------------
    // FRANCHISE DETAILS
    // -----------------------------------
    const franchiseDetails = {
      commission: formData.get("franchiseDetails[commission]"),
      termsAndConditions: formData.get("franchiseDetails[termsAndConditions]"),
      investmentRange: [],
      monthlyEarnPotential: [],
      franchiseModel: [],
      extraSections: [],
      extraImages: [],
    };

    for (let i = 0; ; i++) {
      const minRange = formData.get(`franchiseDetails[investmentRange][${i}][minRange]`);
      const maxRange = formData.get(`franchiseDetails[investmentRange][${i}][maxRange]`);
      if (!minRange || !maxRange) break;
      franchiseDetails.investmentRange.push({ minRange, maxRange });
    }

    for (let i = 0; ; i++) {
      const minEarn = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][minEarn]`);
      const maxEarn = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][maxEarn]`);
      if (!minEarn || !maxEarn) break;
      franchiseDetails.monthlyEarnPotential.push({ minEarn, maxEarn });
    }

    for (let i = 0; ; i++) {
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

    // -----------------------------------
    // FINAL CALCULATIONS
    // -----------------------------------
    const discountedPrice = discount
      ? Math.floor(price - price * (discount / 100))
      : price;

    const gstInRupees = (discountedPrice * gst) / 100;
    const totalWithGst = discountedPrice + gstInRupees;

    // -----------------------------------
    // SAVE SERVICE
    // -----------------------------------
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

    return NextResponse.json(
      { success: true, data: newService },
      { status: 201, headers: corsHeaders }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}



// NEW PAGINATION
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const sort = searchParams.get('sort');
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : null;
    const skip = limit ? (page - 1) * limit : 0;

    const filter: Record<string, unknown> = { isDeleted: false };

    if (search) {
      filter.serviceName = { $regex: `\\b${search}[a-zA-Z]*`, $options: 'i' };
    }

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;

    let sortOption: Record<string, 1 | -1> = {};

    switch (sort) {
      case 'latest': sortOption = { createdAt: -1 }; break;
      case 'oldest': sortOption = { createdAt: 1 }; break;
      case 'ascending': sortOption = { serviceName: 1 }; break;
      case 'descending': sortOption = { serviceName: -1 }; break;
      case 'asc': sortOption = { price: 1 }; break;
      case 'desc': sortOption = { price: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const total = await Service.countDocuments(filter);

    let query = Service.find(filter)
      .populate('category')
      .populate('subcategory')
      .populate({
        path: 'providerPrices.provider',
        model: 'Provider',
        select: 'fullName storeInfo.storeName storeInfo.logo',
      })
      .sort({ sortOrder: 1, ...sortOption });

    if (limit) query = query.skip(skip).limit(limit);

    const services = await query.exec();

    return NextResponse.json(
      {
        success: true,
        page: limit ? page : 1,
        limit: limit ?? total,
        total,
        totalPages: limit ? Math.ceil(total / limit) : 1,
        data: services,
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



