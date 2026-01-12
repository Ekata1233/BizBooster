import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import WhyJustOurService from "@/models/WhyJustOurService";
import Category from "@/models/Category";
import "@/models/Service";
import "@/models/Subcategory"
import mongoose from "mongoose";
import "@/models/Banner";
import "@/models/Coupon";
import"@/models/Ad";
import "@/models/Offer"; 
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

const getIdFromReq = (req: Request) => {
  const url = new URL(req.url);
  return url.pathname.split("/").pop();
};


// ✅ GET BY ID
export async function GET(req: Request) {
await connectToDatabase();

  try {
    const id = getIdFromReq(req);

    const service = await WhyJustOurService
      .findById(id)
      .populate("module", "name");

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: service },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}


// ✅ UPDATE
export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    const id = getIdFromReq(req);
    const formData = await req.formData();
    

    // 🔍 Debug (recommended)
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const updateData: any = {};

    // ---------------- BASIC FIELDS ----------------
    const name = formData.get("name") as string;
    const moduleId = formData.get("module") as string;
    const imageFile = formData.get("image") as File | null;

    if (name) updateData.name = name;
    if (moduleId) updateData.module = moduleId;

    // ---------------- IMAGE UPLOAD ----------------
    // if (imageFile && imageFile instanceof File && imageFile.size > 0) {
    //   const buffer = Buffer.from(await imageFile.arrayBuffer());

    //   const upload = await imagekit.upload({
    //     file: buffer,
    //     fileName: `${uuidv4()}-${imageFile.name}`,
    //     folder: "/category",
    //   });

    //   updateData.image = upload.url;
    // }

    if (imageFile && imageFile.size > 0) {
  const buffer = Buffer.from(await imageFile.arrayBuffer());

  const upload = await imagekit.upload({
    file: buffer,
    fileName: `${uuidv4()}-${imageFile.name}`,
    folder: "/category",
  });

  updateData.image = upload.url;
}

    // ---------------- UPDATE DB ----------------
    const updated = await Category
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate("module", "name");

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400, headers: corsHeaders }
    );
  }
}




// ✅ DELETE (CASCADE DELETE WITH BANNER, COUPON, ADVERTISEMENT)
export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const id = getIdFromReq(req);
    if (!id) throw new Error("Category ID is required");

    // 1️⃣ Delete all subcategories under this category
    await mongoose.model("Subcategory").deleteMany({ category: id });

    // 2️⃣ Find all services under this category
    const services = await mongoose.model("Service").find({ category: id });

    // 3️⃣ For each service, delete related data
    for (const service of services) {
      const serviceId = service._id;

      await mongoose.model("Offer").deleteMany({ service: serviceId });
      await mongoose.model("Coupon").deleteMany({ service: serviceId });
      await mongoose.model("Banner").deleteMany({ service: serviceId });
      await mongoose.model("Ad").deleteMany({ service: serviceId });
    }

    // 4️⃣ Delete all services under this category
    await mongoose.model("Service").deleteMany({ category: id });

    // 5️⃣ Delete records directly linked to category
    await mongoose.model("Banner").deleteMany({ category: id });
    await mongoose.model("Coupon").deleteMany({ category: id });
    await mongoose.model("Ad").deleteMany({ category: id });

    // ✅ NEW LOGIC — Delete banners using this category as screenCategory
    await mongoose.model("Banner").deleteMany({ screenCategory: id });

    // 6️⃣ Finally delete the category itself
    await Category.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message:
          "Category and all related subcategories, services, banners, coupons, ads deleted successfully",
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

