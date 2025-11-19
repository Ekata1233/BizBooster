import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import imagekit from "@/utils/imagekit";
import { connectToDatabase } from "@/utils/db";
import FranchiseService from "@/models/modules/FranchiseService";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

/* --------------------------------------------------------------------------
   🔧 Helper to Upload a Single File 
-------------------------------------------------------------------------- */
async function uploadSingleFile(file: File | null) {
  if (!file) return "";

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await imagekit.upload({
    file: buffer,
    fileName: uuidv4() + "-" + file.name,
    folder: "/services",
  });

  return uploaded.url;
}

/* --------------------------------------------------------------------------
   🔧 Helper to Upload Multiple Files
-------------------------------------------------------------------------- */
async function uploadMultipleFiles(files: (File | null)[]) {
  const urls: string[] = [];
  for (const file of files) {
    if (file) {
      urls.push(await uploadSingleFile(file));
    }
  }
  return urls;
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();

    /* -----------------------------------------------------
       🔹 REQUIRED FIELDS
    ------------------------------------------------------ */
    const moduleId = formData.get("moduleId") as string;
    const categoryId = formData.get("categoryId") as string;
    const serviceName = formData.get("serviceName") as string;

    if (!moduleId || !categoryId || !serviceName) {
      return NextResponse.json(
        {
          success: false,
          message: "moduleId, categoryId and serviceName are required.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    /* -----------------------------------------------------
       🔹 UPLOAD BANNER IMAGE
    ------------------------------------------------------ */
    const bannerImage = await uploadSingleFile(
      formData.get("bannerImage") as unknown as File
    );

    /* -----------------------------------------------------
       🔹 UPLOAD MULTIPLE HIGHLIGHT IMAGES
    ------------------------------------------------------ */
    const highlightFiles = formData.getAll("highlightImages") as File[];
    const highlightImages = await uploadMultipleFiles(highlightFiles);

    /* -----------------------------------------------------
       🔹 PARSE JSON FIELDS
    ------------------------------------------------------ */
    const whyChooseUs = JSON.parse(formData.get("whyChooseUs") as string || "[]");
    const howItWorks = JSON.parse(formData.get("howItWorks") as string || "[]");
    const assuredBy = JSON.parse(formData.get("assuredBy") as string || "{}");
    const moreInfo = JSON.parse(formData.get("moreInfo") as string || "[]");

    /* -----------------------------------------------------
       🔹 Upload icons inside whyChooseUs[]
    ------------------------------------------------------ */
    for (let i = 0; i < whyChooseUs.length; i++) {
      const file = formData.get(`whyChooseUs[${i}].icon`) as File;
      if (file) whyChooseUs[i].icon = await uploadSingleFile(file);
    }

    /* -----------------------------------------------------
       🔹 Upload icons inside howItWorks[]
    ------------------------------------------------------ */
    for (let i = 0; i < howItWorks.length; i++) {
      const file = formData.get(`howItWorks[${i}].icon`) as File;
      if (file) howItWorks[i].icon = await uploadSingleFile(file);
    }

    /* -----------------------------------------------------
       🔹 assuredBy.icon upload
    ------------------------------------------------------ */
    const assuredIcon = formData.get("assuredBy.icon") as File;
    if (assuredIcon) {
      assuredBy.icon = await uploadSingleFile(assuredIcon);
    }

    /* -----------------------------------------------------
       🔹 moreInfo[].image upload
    ------------------------------------------------------ */
    for (let i = 0; i < moreInfo.length; i++) {
      const file = formData.get(`moreInfo[${i}].image`) as File;
      if (file) moreInfo[i].image = await uploadSingleFile(file);
    }

    /* -----------------------------------------------------
       🔹 Base payload
    ------------------------------------------------------ */
    const basePayload = {
      moduleId,
      categoryId,
      subCategoryId: formData.get("subCategoryId") || null,

      serviceName,
      shortDescription: formData.get("shortDescription") as string,
      bannerImage,
      highlightImages,

      benefits: formData.get("benefits") as string,
      aboutUs: formData.get("aboutUs") as string,
      termsAndConditions: formData.get("termsAndConditions") as string,

      whyChooseUs,
      howItWorks,
      assuredBy,
      moreInfo,

      faqs: JSON.parse(formData.get("faqs") as string || "[]"),
      serviceCommsion: JSON.parse(formData.get("serviceCommsion") as string || "{}"),
    };

    /* -----------------------------------------------------
       🔹 Child (Franchise) specific payload
    ------------------------------------------------------ */
    const childPayload = {
      investmentRange: JSON.parse(formData.get("investmentRange") as string || "{}"),
      monthlyEarningPotential: JSON.parse(formData.get("monthlyEarningPotential") as string || "{}"),

      operatingCities: Number(formData.get("operatingCities") || 0),
      about: formData.get("about") as string,
      establishedDate: formData.get("establishedDate"),
      firstFranchiseDate: formData.get("firstFranchiseDate"),
      totalOutlets: Number(formData.get("totalOutlets") || 0),
      profitMargin: Number(formData.get("profitMargin") || 0),
      activePartners: Number(formData.get("activePartners") || 0),
      cities: Number(formData.get("cities") || 0),
      years: Number(formData.get("years") || 0),

      franchiseOperatingModel: JSON.parse(formData.get("franchiseOperatingModel") as string || "{}"),
      businessFundamentals: JSON.parse(formData.get("businessFundamentals") as string || "{}"),
      franchiseModel: JSON.parse(formData.get("franchiseModel") as string || "[]"),
      keyAdvantages: JSON.parse(formData.get("keyAdvantages") as string || "[]"),
      CompleteSupportSystem: JSON.parse(formData.get("CompleteSupportSystem") as string || "[]"),
      trainingDetails: JSON.parse(formData.get("trainingDetails") as string || "[]"),
      agreementDetails: JSON.parse(formData.get("agreementDetails") as string || "[]"),
      goodThings: JSON.parse(formData.get("goodThings") as string || "[]"),
      thingsToImprove: JSON.parse(formData.get("thingsToImprove") as string || "[]"),
      compareAndChoose: JSON.parse(formData.get("compareAndChoose") as string || "[]"),
      companyDetails: JSON.parse(formData.get("companyDetails") as string || "{}"),
    };

    /* -----------------------------------------------------
       🔹 FINAL CREATE DOCUMENT
    ------------------------------------------------------ */
    const newService = await FranchiseService.create({
      ...basePayload,
      ...childPayload,
      serviceType: "FranchiseService",
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
