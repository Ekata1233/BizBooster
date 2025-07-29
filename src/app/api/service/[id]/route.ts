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

    console.log("id of service : ", id);

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing ID parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const formData = await req.formData();

    console.log("service data for the update : ", formData)

    // Extract fields (adjust according to your schema)
    const serviceName = formData.get("name") as string;
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const priceStr = formData.get("price") as string;
    const discountStr = formData.get("discount") as string | null;
    // Handle gst & includeGst
    const gstStr = formData.get("gst") as string | null;
    const includeGstStr = formData.get("includeGst") as string | null;
    const gst = gstStr ? parseFloat(gstStr) : 0;
    const includeGst = includeGstStr === "true";

    // Calculate GST in Rupees
   // Step 4: Use discountedPrice in calculations
// const gstInRupees = includeGst ? (discountedPrice * gst) / 100 : 0;
// const totalWithGst = discountedPrice + gstInRupees;

    // Handle tags
    const tags = formData.getAll("tags")?.filter(Boolean) as string[];

    // Handle recommendedServices
    const recommendedStr = formData.get("recommendedServices") as string | null;
    const recommendedServices = recommendedStr === "true";

    // Handle keyValues (JSON string expected from frontend)
    let keyValues = [];
    const keyValuesStr = formData.get("keyValues") as string | null;
    if (keyValuesStr) {
      try {
        keyValues = JSON.parse(keyValuesStr);
      } catch (error) {
        console.warn("Invalid keyValues JSON", error);
      }
    }


    interface NestedFormData {
      [key: string]: string | NestedFormData | NestedFormData[];
    }

    function parseNestedFormData(formData: FormData): NestedFormData {
      const data: NestedFormData = {};

      for (const [key, value] of formData.entries()) {
        if (typeof value === "object") continue; // skip files for now

        const keys = key
          .replace(/\]/g, "")
          .split("[")
          .flatMap(k => k.split(".")); // support both [key] and dot.key

        let current = data;
        for (let i = 0; i < keys.length; i++) {
          const part = keys[i];
          if (i === keys.length - 1) {
            current[part] = value.toString();
          } else {
            if (!current[part]) {
              // check if next is array index
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

    if (!serviceName || !category || !priceStr) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400, headers: corsHeaders }
      );
    }

    const price = parseFloat(priceStr);
    if (isNaN(price)) {
      return NextResponse.json(
        { success: false, message: "Price must be a valid number." },
        { status: 400, headers: corsHeaders }
      );
    }

    let discount: number = 0;
    if (discountStr !== null && discountStr.trim() !== "") {
      const parsedDiscount = parseFloat(discountStr);
      if (!isNaN(parsedDiscount)) {
        discount = parsedDiscount;
      }
    }

    // Calculate discountedPrice
    const discountedPrice = price - (price * discount / 100);

    // Handle thumbnail image upload (optional)
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

    // Handle banner images upload (optional, multiple)
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

    // Define the type for updateData
    interface UpdateData {
      serviceName: string;
      category: string;
      subcategory?: string;
      price: number;
      discount?: number;
      discountedPrice?: number;
      gst?: number;
  includeGst?: boolean;
  gstInRupees?: number;
  totalWithGst?: number;
  tags?: string[];
  recommendedServices?: boolean;
  // keyValues?: KeyValue[];
      serviceDetails: NestedFormData;
      franchiseDetails: NestedFormData;
      isDeleted: boolean;
      thumbnailImage?: string;
      bannerImages?: string[];
      
    }

    const updateData: UpdateData = {
      serviceName,
      category,
      price,
      discount,
      discountedPrice,
      serviceDetails,
      franchiseDetails,
      isDeleted: false,
      gst,
      includeGst,
      // gstInRupees,
      // totalWithGst,
      tags,
      recommendedServices,
      // keyValues,

    };
    if (subcategory) {
      updateData.subcategory = subcategory;
    }
    if (thumbnailImageUrl) updateData.thumbnailImage = thumbnailImageUrl;
    if (bannerImagesUrls.length > 0) updateData.bannerImages = bannerImagesUrls;

    // Update the service document
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
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
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