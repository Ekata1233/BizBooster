import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";

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

    const service = await Service.findById(id).populate("category")
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

    console.log("id of service : ",id);
    
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
    // const serviceDetailsStr = formData.get("serviceDetails") as string;
    // const franchiseDetailsStr = formData.get("franchiseDetails") as string;

    function parseNestedFormData(formData: FormData): Record<string, any> {
      const data: Record<string, any> = {};

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
            current[part] = value;
          } else {
            if (!current[part]) {
              // check if next is array index
              const nextIsArrayIndex = /^\d+$/.test(keys[i + 1]);
              current[part] = nextIsArrayIndex ? [] : {};
            }
            current = current[part];
          }
        }
      }

      return data;
    }

    const fullData = parseNestedFormData(formData);
    const serviceDetails = fullData.serviceDetails || {};
    const franchiseDetails = fullData.franchiseDetails || {};



    if (!serviceName || !category || !subcategory || !priceStr) {
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

    // Define the type for updateData to avoid using any
    interface UpdateData {
      serviceName: string;
      category: string;
      subcategory: string;
      price: number;
      serviceDetails: object;
      franchiseDetails: object;
      isDeleted: boolean;
      thumbnailImage?: string;
      bannerImages?: string[];
    }

    const updateData: UpdateData = {
      serviceName,
      category,
      subcategory,
      price,
      serviceDetails,
      franchiseDetails,
      isDeleted: false,
    };
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
