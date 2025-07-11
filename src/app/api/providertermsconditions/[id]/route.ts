// import { NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '@/utils/db';
// import ProviderTermsConditions from '@/models/ProviderTermsConditions';
// import { Types } from 'mongoose';

// export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
//   await connectToDatabase();

//   try {
//     const id = params.id;
//     const { content, module } = await req.json();

//     if (!Types.ObjectId.isValid(id)) {
//       return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
//     }

//     const updated = await ProviderTermsConditions.findByIdAndUpdate(
//       id,
//       { content, module },
//       { new: true }
//     );

//     if (!updated) {
//       return NextResponse.json({ success: false, message: 'Policy not found' }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, data: updated });
//   } catch (err) {
//     console.error('PUT error:', err);
//     return NextResponse.json({ success: false, message: 'Failed to update' }, { status: 500 });
//   }
// }

// export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
//   await connectToDatabase();

//   try {
//     const id = params.id;

//     if (!Types.ObjectId.isValid(id)) {
//       return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
//     }

//     const deleted = await ProviderTermsConditions.findByIdAndDelete(id);

//     if (!deleted) {
//       return NextResponse.json({ success: false, message: 'Entry not found' }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, message: 'Deleted successfully' });
//   } catch (err) {
//     console.error('DELETE error:', err);
//     return NextResponse.json({ success: false, message: 'Failed to delete' }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import "@/models/Category";      // registers the Category model
import "@/models/Subcategory";
import "@/models/WhyChoose";
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
    console.log("Service in backend", formData)

    // Required fields from formData (adjust based on your schema)
    const serviceName = formData.get("basic[name]") as string;
    const category = formData.get("basic[category]") as string;
    let subcategory: string | undefined = formData.get("basic[subcategory]") as string;
    subcategory = subcategory?.trim() === "" ? undefined : subcategory;
    const priceStr = formData.get("basic[price]");
    const discount = formData.get("basic[discount]");
    const tags: string[] = [];

    console.log("sibcategory in servce : ", subcategory);

    // Iterate all entries in formData to find all tags
    for (const key of formData.keys()) {
      if (key.startsWith("basic[tags]")) {
        const tagValue = formData.get(key);
        if (typeof tagValue === "string") {
          tags.push(tagValue);
        }
      }
    }

    if (!serviceName || !category || !priceStr) {
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

    // Handle Highlight (array of files)
    const highlightImagesUrls: string[] = [];
    const highlightFiles: File[] = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("service[highlight]") && value instanceof File) {
        highlightFiles.push(value);
      }
    }

    for (const file of highlightFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResponse = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${file.name}`,
        folder: "/services/highlight",
      });
      highlightImagesUrls.push(uploadResponse.url);
    }

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

    const whyChooseIds: string[] = [];
    let index = 0;
    while (true) {
      const id = formData.get(`service[whyChoose][${index}][_id]`) as string | null;

      if (!id) break; // if no id, assume no more items

      whyChooseIds.push(id);
      index++;
    }


    const keyValues = extractArray("basic[keyValues]", ["key", "value"], formData);


    const serviceDetails = {
      benefits: formData.get("service[benefits]") as string,
      overview: formData.get("service[overview]") as string,
      highlight: highlightImagesUrls,
      document: formData.get("service[document]") as string,
      howItWorks: formData.get("service[howItWorks]") as string,
      termsAndConditions: formData.get("service[terms]") as string,
      faq: extractArray("service[faqs]", ["question", "answer"], formData),
      extraSections: extractArray("service[rows]", ["title", "description"], formData),
      whyChoose: whyChooseIds,
    };

    // 🛠 Manually construct franchiseDetails
    const franchiseDetails = {
      commission: formData.get("franchise[commission]") as string,
      overview: formData.get("franchise[overview]") as string,
      howItWorks: formData.get("franchise[howItWorks]") as string,
      termsAndConditions: formData.get("franchise[termsAndConditions]") as string,
      extraSections: extractArray("franchise[rows]", ["title", "description"], formData),
    };

    // Convert price and discount to numbers
    const discountedPrice = discount
      ? Math.floor(price - (price * parseFloat(discount as string) / 100))
      : price;

    const newService = await Service.create({
      serviceName,
      category,
      subcategory,
      price,
      discount,
      discountedPrice,
      thumbnailImage: thumbnailImageUrl,
      bannerImages: bannerImagesUrls,
      tags,
      keyValues,
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
      .populate('serviceDetails.whyChoose')
      .populate({
        path: 'providerPrices.provider',
        model: 'Provider',
        select: 'fullName',
      })
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
