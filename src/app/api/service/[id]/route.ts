import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import "@/models/Category"
import "@/models/Subcategory"
import "@/models/WhyChoose"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const service = await Service.findById(id).populate("category").populate('serviceDetails.whyChoose')
      .populate("subcategory");

    if (!service || service.isDeleted) {
      return NextResponse.json(
        { success: false, message: "Service not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: service },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await req.formData();

    console.log("formdata of the update service : ", formData);

    const serviceName = formData.get("name") as string;
    const category = formData.get("category") as string;
    // const subcategory = formData.get("subcategory") as string;
    const priceStr = formData.get("price") as string;
    const subcategoryRaw = formData.get("subcategory") as string;
    const subcategory = subcategoryRaw && subcategoryRaw.trim() !== "" ? subcategoryRaw : undefined;

    const discountStr = formData.get("discount") as string | null;
    const gstStr = formData.get("gst") as string | null;
    const includeGstStr = formData.get("includeGst") as string | null;
    const recommendedServicesStr = formData.get("recommendedServices") as string;

    const gst = gstStr ? parseFloat(gstStr) : 0;
    const includeGst = includeGstStr === "true";
    const recommendedServices = recommendedServicesStr === "true";

    const tags: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("tags") && typeof value === "string") {
        tags.push(value);
      }
    }

    // Parse nested formData
    interface NestedFormData {
      [key: string]: string | NestedFormData | NestedFormData[];
    }

    function parseNestedFormData(formData: FormData): NestedFormData {
      const data: NestedFormData = {};
      for (const [key, value] of formData.entries()) {
        if (typeof value === "object") continue;
        const keys = key.replace(/\]/g, "").split("[").flatMap(k => k.split("."));
        let current = data;
        for (let i = 0; i < keys.length; i++) {
          const part = keys[i];
          if (i === keys.length - 1) {
            current[part] = value.toString();
          } else {
            if (!current[part]) {
              const nextIsArrayIndex = /^\d+$/.test(keys[i + 1]);
              current[part] = nextIsArrayIndex ? [] : {};
            }
            current = current[part] as NestedFormData;
          }
        }
      }
      return data;
    }

    const fullData = parseNestedFormData(formData);
    const serviceDetails = fullData.serviceDetails as NestedFormData || {};
    const franchiseDetails = fullData.franchiseDetails as NestedFormData || {};

    const keyValues: { key: string; value: string }[] = [];
    let index = 0;
    while (true) {
      const key = formData.get(`keyValues[${index}][key]`);
      const value = formData.get(`keyValues[${index}][value]`);
      if (!key && !value) break;
      if (key && value) keyValues.push({ key: key.toString(), value: value.toString() });
      index++;
    }

    // const whyChooseIds: string[] = [];
    // let whyIndex = 0;
    // while (true) {
    //   const id = formData.get(`whyChoose[${whyIndex}][_id]`);
    //   if (!id) break;
    //   whyChooseIds.push(id.toString());
    //   whyIndex++;
    // }

    const whyChooseIds: string[] = [];
    let whyIndex = 0;
    while (true) {
      const id = formData.get(`serviceDetails[whyChoose][${whyIndex}][_id]`);
      if (!id) break;
      whyChooseIds.push(id.toString());
      whyIndex++;
    }


    const price = parseFloat(priceStr);
    let discount = 0;
    if (discountStr !== null && discountStr.trim() !== "") {
      const parsedDiscount = parseFloat(discountStr);
      if (!isNaN(parsedDiscount)) {
        discount = parsedDiscount;
      }
    }

    const discountedPrice = price - (price * discount / 100);
    const gstInRupees = (discountedPrice * gst) / 100;
    const totalWithGst = discountedPrice + gstInRupees;

    // Thumbnail
    let thumbnailImageUrl = "";
    const thumbnailFile = formData.get("thumbnailImage") as File | null;
    if (thumbnailFile && thumbnailFile instanceof File) {
      const arrayBuffer = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${thumbnailFile.name}`,
        folder: "/services/thumbnail",
      });
      thumbnailImageUrl = uploadResponse.url;
    }

    // Banner images
    const bannerImagesUrls: string[] = [];
    const bannerFiles = formData.getAll("bannerImages") as File[];
    for (const file of bannerFiles) {
      if (file && file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${file.name}`,
          folder: "/services/banners",
        });
        bannerImagesUrls.push(uploadResponse.url);
      }
    }

    // Highlight images
    // const highlightImagesUrls: string[] = [];
    // const highlightFiles: File[] = [];
    // for (const [key, value] of formData.entries()) {
    //   if (key.startsWith("highlight") && value instanceof File) {
    //     highlightFiles.push(value);
    //   }
    // }
    // for (const file of highlightFiles) {
    //   const arrayBuffer = await file.arrayBuffer();
    //   const buffer = Buffer.from(arrayBuffer);
    //   const uploadResponse = await imagekit.upload({
    //     file: buffer,
    //     fileName: `${uuidv4()}-${file.name}`,
    //     folder: "/services/highlight",
    //   });
    //   highlightImagesUrls.push(uploadResponse.url);
    // }

    // Extract highlight URLs from formData (not files)
// Highlight images
const highlightImagesUrls: string[] = [];
let highlightIndex = 0;
while (true) {
  const highlightValue = formData.get(`serviceDetails[highlight][${highlightIndex}]`);
  if (!highlightValue) break;

  if (highlightValue instanceof File) {
    // New uploaded file → upload to ImageKit
    const arrayBuffer = await highlightValue.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: `${uuidv4()}-${highlightValue.name}`,
      folder: "/services/highlight",
    });
    highlightImagesUrls.push(uploadResponse.url);
  } else if (typeof highlightValue === "string") {
    // Existing URL → keep it
    highlightImagesUrls.push(highlightValue);
  }

  highlightIndex++;
}



    // Add highlight images into serviceDetails
    // serviceDetails.highlight = highlightImagesUrls;

    const updateData = {
      serviceName,
      category,
      // subcategory,
      ...(subcategory && { subcategory }),
      price,
      discount,
      discountedPrice,
      gst,
      includeGst,
      gstInRupees,
      totalWithGst,
      serviceDetails: {
        ...serviceDetails,
        highlight: highlightImagesUrls,
        whyChoose: whyChooseIds,
      },
      franchiseDetails,
      tags,
      keyValues,
      recommendedServices,
      isDeleted: false,
      ...(thumbnailImageUrl && { thumbnailImage: thumbnailImageUrl }),
      ...(bannerImagesUrls.length > 0 && { bannerImages: bannerImagesUrls }),
    };

    const updatedService = await Service.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedService) {
      return NextResponse.json(
        { success: false, message: "Service not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedService },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 400, headers: corsHeaders }
    );
  }
}


export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const deletedService = await Service.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedService) {
      return NextResponse.json(
        { success: false, message: "Service not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Service soft-deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}