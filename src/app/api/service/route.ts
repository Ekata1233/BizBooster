import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import "@/models/Category";      // registers the Category model
import "@/models/Subcategory";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    console.log("Service in backend", formData)

    // Required fields from formData (adjust based on your schema)
    const serviceName = formData.get("basic[name]") as string;
    const category = formData.get("basic[category]") as string;
    const subcategory = formData.get("basic[subcategory]") as string;
    const priceStr = formData.get("basic[price]");

    if (!serviceName || !category || !subcategory || !priceStr) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400, headers: corsHeaders }
      );
    }

    const price = parseFloat(priceStr as string);
    if (isNaN(price)) {
      return NextResponse.json(
        { success: false, message: "Price must be a valid number." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Handle images
    let thumbnailImageUrl = "";
    const thumbnailFile = formData.get("basic[thumbnail]") as File;
    if (thumbnailFile) {
      const arrayBuffer = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${thumbnailFile.name}`,
        folder: "/services/thumbnail",
      });
      thumbnailImageUrl = uploadResponse.url;
    } else {
      return NextResponse.json(
        { success: false, message: "Thumbnail image is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Handle bannerImages (array of files)
    const bannerImagesUrls: string[] = [];
    const bannerFiles: File[] = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("basic[covers]") && value instanceof File) {
        bannerFiles.push(value);
      }
    }

    for (const file of bannerFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${file.name}`,
        folder: "/services/banners",
      });
      bannerImagesUrls.push(uploadResponse.url);
    }


    // serviceDetails - JSON string or individual fields? Assuming JSON string here:
    // const serviceDetailsStr = formData.get("serviceDetails") as string;
    // let serviceDetails = {};
    // if (serviceDetailsStr) {
    //   try {
    //     serviceDetails = JSON.parse(serviceDetailsStr);
    //   } catch {
    //     // Ignore or return error
    //     return NextResponse.json(
    //       { success: false, message: "Invalid JSON for serviceDetails." },
    //       { status: 400, headers: corsHeaders }
    //     );
    //   }
    // }

    // // franchiseDetails - similarly, parse JSON if present
    // const franchiseDetailsStr = formData.get("franchiseDetails") as string;
    // let franchiseDetails = {};
    // if (franchiseDetailsStr) {
    //   try {
    //     franchiseDetails = JSON.parse(franchiseDetailsStr);
    //   } catch {
    //     return NextResponse.json(
    //       { success: false, message: "Invalid JSON for franchiseDetails." },
    //       { status: 400, headers: corsHeaders }
    //     );
    //   }
    // }

    const extractArray = (
      prefix: string,
      fields: string[],
      formData: FormData
    ) => {
      const result = [];
      let index = 0;
      while (true) {
        const item: Record<string, string> = {};
        let hasData = false;

        for (const field of fields) {
          const key = `${prefix}[${index}][${field}]`;
          const value = formData.get(key) as string | null;
          if (value !== null && value !== "") {
            item[field] = value;
            hasData = true;
          }
        }

        if (!hasData) break;
        result.push(item);
        index++;
      }
      return result;
    };

    const whyChooseItems = [];
    let index = 0;
    while (true) {
      const title = formData.get(`service[whyChoose][${index}][title]`) as string | null;
      const description = formData.get(`service[whyChoose][${index}][description]`) as string | null;
      const imageFile = formData.get(`service[whyChoose][${index}][image]`) as File | null;

      if (!title && !description && !imageFile) break;

      let imageUrl = "";
      if (imageFile && imageFile.size > 0) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${imageFile.name}`,
          folder: "/services/whyChoose",
        });
        imageUrl = uploadResponse.url;
      }

      whyChooseItems.push({
        title: title ?? "",
        description: description ?? "",
        image: imageUrl,
      });

      index++;
    }

    const serviceDetails = {
      benefits: formData.get("service[benefits]") as string,
      overview: formData.get("service[overview]") as string,
      highlight: formData.get("service[highlight]") as string,
      document: formData.get("service[document]") as string,
      howItWorks: formData.get("service[howItWorks]") as string,
      termsAndConditions: formData.get("service[terms]") as string,
      faq: extractArray("service[faqs]", ["question", "answer"], formData),
      extraSections: extractArray("service[rows]", ["title", "description"], formData),
      whyChoose: whyChooseItems,
    };

    // 🛠 Manually construct franchiseDetails
    const franchiseDetails = {
      commission: formData.get("franchise[commission]") as string,
      overview: formData.get("franchise[overview]") as string,
      howItWorks: formData.get("franchise[howItWorks]") as string,
      termsAndConditions: formData.get("franchise[terms]") as string,
      extraSections: extractArray("franchise[rows]", ["title", "description"], formData),
    };

    const newService = await Service.create({
      serviceName,
      category,
      subcategory,
      price,
      thumbnailImage: thumbnailImageUrl,
      bannerImages: bannerImagesUrls,
      serviceDetails,
      franchiseDetails,
      isDeleted: false,
    });

    return NextResponse.json(
      { success: true, data: newService },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 400, headers: corsHeaders }
    );
  }
}

// GET all services with optional search by serviceName
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const sort = searchParams.get('sort');

    // Build filter
const filter: Record<string, unknown> = { isDeleted: false };

    if (search) {
      filter.serviceName = { $regex: search, $options: 'i' };
    }

    if (category) {
      filter.category = category; // should be ObjectId string
    }

    if (subcategory) {
      filter.subcategory = subcategory;
    }

    // Build query
     let sortOption: Record<string, 1 | -1> = {};

    switch (sort) {
      case 'latest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'ascending':
        sortOption = { serviceName: 1 };
        break;
      case 'descending':
        sortOption = { serviceName: -1 };
        break;
      case 'asc':
        sortOption = { price: 1 };
        break;
      case 'desc':
        sortOption = { price: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Build query with filter and sort
    const services = await Service.find(filter)
      .populate('category')
      .populate('subcategory')
      .sort(sortOption)
      .exec();

    return NextResponse.json(
      { success: true, data: services },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
