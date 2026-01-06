import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Service from "@/models/Service";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import { File } from "buffer";
import mongoose from "mongoose";
import "@/models/Category"
import "@/models/Subcategory"
import "@/models/Provider"

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const formData = await req.formData();
    console.log("-------------formdata-------------- : ", formData);

    // --- Basic Fields ---
    const serviceName = (formData.get("serviceName") as string)?.trim();
    const category = (formData.get("category") as string)?.trim();
    const subcategory = (formData.get("subcategory") as string)?.trim() || null;
    const price = Number(formData.get("price") || 0);
    const discount = Number(formData.get("discount") || 0);
    const gst = Number(formData.get("gst") || 0);
    const includeGst = formData.get("includeGst") === "true";
    const recommendedServices = formData.get("recommendedServices") === "true";

    if (!serviceName) return NextResponse.json({ success: false, message: "Service name is required" }, { status: 400, headers: corsHeaders });
    if (!category) return NextResponse.json({ success: false, message: "Category is required" }, { status: 400, headers: corsHeaders });

    // --- Tags ---
    const tags: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("tags[")) {
        const val = formData.get(key) as string;
        if (val) tags.push(val);
      }
    }

    // --- Key Values ---
    const keyValues: any[] = [];
    for (let i = 0; i < 20; i++) {
      const key = formData.get(`keyValues[${i}][key]`) as string | null;
      const value = formData.get(`keyValues[${i}][value]`) as string | null;
      const iconFile = formData.get(`keyValues[${i}][icon]`);

      if (!key && !value && !iconFile) break;

      let iconUrl = "";
      if (iconFile instanceof File) {
        try {
          const buffer = Buffer.from(await iconFile.arrayBuffer());
          const upload = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${iconFile.name}`,
            folder: "/services/keyValueIcons",
          });
          iconUrl = upload.url;
        } catch (error) {
          console.error(`Failed to upload keyValues[${i}] icon:`, error);
          iconUrl = "";
        }
      } else if (typeof iconFile === "string") {
        iconUrl = iconFile || "";
      }

      keyValues.push({
        key: key || "",
        value: value || "",
        icon: iconUrl,
      });
    }

    // --- Thumbnail ---
    let thumbnailImage = "";
    const thumbnailFile = formData.get("thumbnail") as File | null;
    if (thumbnailFile instanceof File) {
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const upload = await imagekit.upload({ 
        file: buffer,
        fileName: `${uuidv4()}-${thumbnailFile.name}`,
        folder: "/services/thumbnail",
      });
      thumbnailImage = upload.url;
    }

    // --- Banner Images ---
    const bannerImages: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("bannerImages")) {
        const file = formData.get(key);
        if (file instanceof File) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const upload = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${file.name}`,
            folder: "/services/banners",
          });
          bannerImages.push(upload.url);
        }
      }
    }

    // --- Provider Prices ---
    const providerPrices: any[] = [];
    for (let i = 0; i < 20; i++) {
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

    // --- Helper: Upload File ---
    async function handleFileUpload(file: File, folder: string) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const upload = await imagekit.upload({
        file: buffer,
        fileName: `${uuidv4()}-${file.name}`,
        folder,
      });
      return upload.url;
    }

    // --- Service Details (with new extended fields) ---
    const serviceDetails: any = {
      benefits: JSON.parse(formData.get("benefits") as string || "[]"),
      aboutUs: JSON.parse(formData.get("aboutUs") as string || "[]"),
      document: JSON.parse(formData.get("document") as string || "[]"),
      termsAndConditions: JSON.parse(formData.get("termsAndConditions") as string || "[]"),
      highlight: [],
      assuredByFetchTrue: [],
      howItWorks: [],
      whyChooseUs: [],
      weRequired: [],
      weDeliver: [],
      moreInfo: [],
      connectWith: [],
      timeRequired: [],
      faq: [],
      packages: [],
      extraSections: [],
      extraImages: [],
      
      // --- NEW EXTENDED FIELDS ---
      operatingCities: [],
      brochureImage: [],
      emiavalable: [],
      counter: [],
      franchiseOperatingModel: [],
      businessFundamental: {
        description: "",
        points: []
      },
      keyAdvantages: [],
      completeSupportSystem: [],
      trainingDetails: [],
      agreementDetails: [],
      goodThings: [],
      compareAndChoose: [],
      companyDetails: [],
      roi: [],
      level: "beginner",
      lessonCount: null,
      duration: {
        weeks: null,
        hours: null
      },
      whatYouWillLearn: [],
      eligibleFor: [],
      courseCurriculum: [],
      courseIncludes: [],
      certificateImage: [],
      whomToSell: [],
      include: [],
      notInclude: [],
      safetyAndAssurance: []
    };

    // --- Highlights ---
    for (const key of formData.keys()) {
      if (key.startsWith("serviceDetails[highlight]")) {
        const file = formData.get(key);
        if (file instanceof File) serviceDetails.highlight.push(await handleFileUpload(file, "/services/highlight"));
      }
    }

    // --- Sections with icon/image ---
    async function processSection(field: string, folder: string, mediaKey: "icon" | "image") {
      const arr: any[] = [];
      for (let i = 0; i < 20; i++) {
        const title = formData.get(`serviceDetails[${field}][${i}][title]`);
        if (!title) break;
        const description = formData.get(`serviceDetails[${field}][${i}][description]`);
        const mediaFile = formData.get(`serviceDetails[${field}][${i}][${mediaKey}]`);
        let url = "";
        if (mediaFile instanceof File) url = await handleFileUpload(mediaFile, folder);
        arr.push({ title, description, [mediaKey]: url });
      }
      return arr;
    }

    serviceDetails.assuredByFetchTrue = await processSection("assuredByFetchTrue", "/services/assuredIcons", "icon");
    serviceDetails.howItWorks = await processSection("howItWorks", "/services/howItWorks", "icon");
    serviceDetails.whyChooseUs = await processSection("whyChooseUs", "/services/whyChooseUs", "icon");
    serviceDetails.moreInfo = await processSection("moreInfo", "/services/moreInfo", "image");

    // --- We Required ---
    for (let i = 0; i < 20; i++) {
      const title = formData.get(`serviceDetails[weRequired][${i}][title]`);
      const description = formData.get(`serviceDetails[weRequired][${i}][description]`);
      if (!title && !description) break;
      serviceDetails.weRequired.push({
        title: title || "",
        description: description || "",
      });
    }

    // --- We Deliver ---
    for (let i = 0; i < 20; i++) {
      const title = formData.get(`serviceDetails[weDeliver][${i}][title]`);
      const description = formData.get(`serviceDetails[weDeliver][${i}][description]`);
      if (!title && !description) break;
      serviceDetails.weDeliver.push({
        title: title || "",
        description: description || "",
      });
    }

    // --- Connect With ---
    for (let i = 0; i < 20; i++) {
      const name = formData.get(`serviceDetails[connectWith][${i}][name]`);
      if (!name) break;
      serviceDetails.connectWith.push({
        name,
        mobileNo: formData.get(`serviceDetails[connectWith][${i}][mobileNo]`),
        email: formData.get(`serviceDetails[connectWith][${i}][email]`),
      });
    }

    // --- Time Required ---
for (let i = 0; i < 20; i++) {
  const range = formData.get(`serviceDetails[timeRequired][${i}][range]`);
  if (!range) break;
  serviceDetails.timeRequired.push({
    range,
    parameters: formData.get(`serviceDetails[timeRequired][${i}][parameters]`) || "",
  });
}

    // --- FAQ ---
    for (let i = 0; i < 20; i++) {
      const question = formData.get(`serviceDetails[faq][${i}][question]`);
      if (!question) break;
      const answer = formData.get(`serviceDetails[faq][${i}][answer]`);
      serviceDetails.faq.push({ question, answer });
    }

    // --- Packages ---
    for (let i = 0; i < 20; i++) {
      const name = formData.get(`serviceDetails[packages][${i}][name]`);
      if (!name) break;
      const pkg: any = {
        name,
        price: formData.get(`serviceDetails[packages][${i}][price]`),
        discount: formData.get(`serviceDetails[packages][${i}][discount]`),
        discountedPrice: formData.get(`serviceDetails[packages][${i}][discountedPrice]`),
        whatYouGet: [],
      };
      for (let j = 0; j < 20; j++) {
        const item = formData.get(`serviceDetails[packages][${i}][whatYouGet][${j}]`);
        if (!item) break;
        pkg.whatYouGet.push(item);
      }
      serviceDetails.packages.push(pkg);
    }
    
    // --- Extra Images ---
    serviceDetails.extraImages = [];
    for (const key of formData.keys()) {
      if (key.startsWith("serviceDetails[extraImages]")) {
        const file = formData.get(key);
        if (file instanceof File) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const upload = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${file.name}`,
            folder: "/services/extraImages",
          });
          serviceDetails.extraImages.push(upload.url);
        }
      }
    }

    // --- Extra Sections ---
    for (let i = 0; i < 20; i++) {
      const title = formData.get(`serviceDetails[extraSections][${i}][title]`);
      if (!title) break;

      const extraSection: any = {
        title,
        subtitle: [],
        description: [],
        subDescription: [],
        lists: [],
        tags: [],
        image: [],
      };

      for (let j = 0; j < 20; j++) {
        const subtitle = formData.get(`serviceDetails[extraSections][${i}][subtitle][${j}]`);
        if (!subtitle) break;
        extraSection.subtitle.push(subtitle);
      }

      for (let j = 0; j < 20; j++) {
        const description = formData.get(`serviceDetails[extraSections][${i}][description][${j}]`);
        if (!description) break;
        extraSection.description.push(description);
      }

      for (let j = 0; j < 20; j++) {
        const subDescription = formData.get(`serviceDetails[extraSections][${i}][subDescription][${j}]`);
        if (!subDescription) break;
        extraSection.subDescription.push(subDescription);
      }

      for (let j = 0; j < 20; j++) {
        const list = formData.get(`serviceDetails[extraSections][${i}][lists][${j}]`);
        if (!list) break;
        extraSection.lists.push(list);
      }

      for (let j = 0; j < 20; j++) {
        const tag = formData.get(`serviceDetails[extraSections][${i}][tags][${j}]`);
        if (!tag) break;
        extraSection.tags.push(tag);
      }

      for (let j = 0; j < 20; j++) {
        const imageFile = formData.get(
          `serviceDetails[extraSections][${i}][image][${j}]`
        );

        if (!(imageFile instanceof File)) break;

        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const upload = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${imageFile.name}`,
          folder: "/services/extraSections",
        });
        extraSection.image.push(upload.url);
      }

      serviceDetails.extraSections.push(extraSection);
    }

    // --- NEW EXTENDED FIELDS PROCESSING ---
    
    // 1. operatingCities
    for (let i = 0; i < 20; i++) {
      const city = formData.get(`serviceDetails[operatingCities][${i}]`);
      if (!city) break;
      serviceDetails.operatingCities.push(city);
    }

    // 2. brochureImage
    for (const key of formData.keys()) {
      if (key.startsWith("serviceDetails[brochureImage]")) {
        const file = formData.get(key);
        if (file instanceof File) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const upload = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${file.name}`,
            folder: "/services/brochure",
          });
          serviceDetails.brochureImage.push(upload.url);
        }
      }
    }

    // 3. emiavalable
    for (let i = 0; i < 20; i++) {
      const emi = formData.get(`serviceDetails[emiavalable][${i}]`);
      if (!emi) break;
      serviceDetails.emiavalable.push(emi);
    }

    // 4. counter
    for (let i = 0; i < 20; i++) {
      const number = formData.get(`serviceDetails[counter][${i}][number]`);
      if (!number) break;
      serviceDetails.counter.push({
        number: Number(number),
        title: formData.get(`serviceDetails[counter][${i}][title]`) || ""
      });
    }

  // 5. franchiseOperatingModel
for (let i = 0; i < 20; i++) {
  const title = formData.get(`serviceDetails[franchiseOperatingModel][${i}][title]`);
  if (!title) break;

  const franchiseModel: any = {
    info: formData.get(`serviceDetails[franchiseOperatingModel][${i}][info]`) || "",
    title: title,
    description: formData.get(`serviceDetails[franchiseOperatingModel][${i}][description]`) || "",
    features: [],
    tags: [],
    example: formData.get(`serviceDetails[franchiseOperatingModel][${i}][example]`) || ""
  };

  // Process features
  for (let j = 0; j < 20; j++) {
    const subtitle = formData.get(`serviceDetails[franchiseOperatingModel][${i}][features][${j}][subtitle]`);
    if (!subtitle) break;
    
    // Look for icon files with the same pattern as brochureImage
    let iconUrl = "";
    for (const key of formData.keys()) {
      if (key.startsWith(`serviceDetails[franchiseOperatingModel][${i}][features][${j}][icon]`)) {
        const file = formData.get(key);
        if (file instanceof File) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const upload = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${file.name}`,
            folder: "/services/franchiseFeatures",
          });
          iconUrl = upload.url;
          break; // Found the file, break the loop
        }
      }
    }

    franchiseModel.features.push({
      icon: iconUrl,
      subtitle: subtitle,
      subDescription: formData.get(`serviceDetails[franchiseOperatingModel][${i}][features][${j}][subDescription]`) || ""
    });
  }

  // Process tags
  for (let j = 0; j < 20; j++) {
    const tag = formData.get(`serviceDetails[franchiseOperatingModel][${i}][tags][${j}]`);
    if (!tag) break;
    franchiseModel.tags.push(tag);
  }

  serviceDetails.franchiseOperatingModel.push(franchiseModel);
}

// 7. keyAdvantages
for (let i = 0; i < 20; i++) {
  const title = formData.get(`serviceDetails[keyAdvantages][${i}][title]`);
  if (!title) break;

  // Look for icon files with the same pattern as brochureImage
  let iconUrl = "";
  for (const key of formData.keys()) {
    if (key.startsWith(`serviceDetails[keyAdvantages][${i}][icon]`)) {
      const file = formData.get(key);
      if (file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const upload = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${file.name}`,
          folder: "/services/keyAdvantages",
        });
        iconUrl = upload.url;
        break; // Found the file, break the loop
      }
    }
  }

  serviceDetails.keyAdvantages.push({
    icon: iconUrl,
    title: title,
    description: formData.get(`serviceDetails[keyAdvantages][${i}][description]`) || ""
  });
}

// 8. completeSupportSystem
for (let i = 0; i < 20; i++) {
  const title = formData.get(`serviceDetails[completeSupportSystem][${i}][title]`);
  if (!title) break;

  // Look for icon files with the same pattern as brochureImage
  let iconUrl = "";
  for (const key of formData.keys()) {
    if (key.startsWith(`serviceDetails[completeSupportSystem][${i}][icon]`)) {
      const file = formData.get(key);
      if (file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const upload = await imagekit.upload({
          file: buffer,
          fileName: `${uuidv4()}-${file.name}`,
          folder: "/services/supportSystem",
        });
        iconUrl = upload.url;
        break; // Found the file, break the loop
      }
    }
  }

  const supportSystem: any = {
    icon: iconUrl,
    title: title,
    lists: []
  };

  // Process lists
  for (let j = 0; j < 20; j++) {
    const listItem = formData.get(`serviceDetails[completeSupportSystem][${i}][lists][${j}]`);
    if (!listItem) break;
    supportSystem.lists.push(listItem);
  }

  serviceDetails.completeSupportSystem.push(supportSystem);
}

    // 6. businessFundamental
    serviceDetails.businessFundamental.description = formData.get("serviceDetails[businessFundamental][description]") || "";
    
    for (let i = 0; i < 20; i++) {
      const subtitle = formData.get(`serviceDetails[businessFundamental][points][${i}][subtitle]`);
      if (!subtitle) break;
      serviceDetails.businessFundamental.points.push({
        subtitle: subtitle,
        subDescription: formData.get(`serviceDetails[businessFundamental][points][${i}][subDescription]`) || ""
      });
    }

//     // 7. keyAdvantages
//     for (let i = 0; i < 20; i++) {
//       const title = formData.get(`serviceDetails[keyAdvantages][${i}][title]`);
//       if (!title) break;

//      let iconUrl = "";

// for (const key of formData.keys()) {
//   if (key === `serviceDetails[keyAdvantages][${i}][icon]`) {
//     const file = formData.get(key);
//     if (file instanceof File) {
//       const buffer = Buffer.from(await file.arrayBuffer());
//       const upload = await imagekit.upload({
//         file: buffer,
//         fileName: `${uuidv4()}-${file.name}`,
//         folder: "/services/keyAdvantages",
//       });
//       iconUrl = upload.url;
//     }
//   }
// }


//       serviceDetails.keyAdvantages.push({
//         icon: iconUrl,
//         title: title,
//         description: formData.get(`serviceDetails[keyAdvantages][${i}][description]`) || ""
//       });
//     }

//     // 8. completeSupportSystem
//     for (let i = 0; i < 20; i++) {
//       const title = formData.get(`serviceDetails[completeSupportSystem][${i}][title]`);
//       if (!title) break;

//      let iconUrl = "";

// for (const key of formData.keys()) {
//   if (key === `serviceDetails[completeSupportSystem][${i}][icon]`) {
//     const file = formData.get(key);
//     if (file instanceof File) {
//       const buffer = Buffer.from(await file.arrayBuffer());
//       const upload = await imagekit.upload({
//         file: buffer,
//         fileName: `${uuidv4()}-${file.name}`,
//         folder: "/services/supportSystem",
//       });
//       iconUrl = upload.url;
//     }
//   }
// }


//       const supportSystem: any = {
//         icon: iconUrl,
//         title: title,
//         lists: []
//       };

//       // Process lists
//       for (let j = 0; j < 20; j++) {
//         const listItem = formData.get(`serviceDetails[completeSupportSystem][${i}][lists][${j}]`);
//         if (!listItem) break;
//         supportSystem.lists.push(listItem);
//       }

//       serviceDetails.completeSupportSystem.push(supportSystem);
//     }

    // 9. trainingDetails
    for (let i = 0; i < 20; i++) {
      const detail = formData.get(`serviceDetails[trainingDetails][${i}]`);
      if (!detail) break;
      serviceDetails.trainingDetails.push(detail);
    }

    // 10. agreementDetails
    for (let i = 0; i < 20; i++) {
      const detail = formData.get(`serviceDetails[agreementDetails][${i}]`);
      if (!detail) break;
      serviceDetails.agreementDetails.push(detail);
    }

    // 11. goodThings
    for (let i = 0; i < 20; i++) {
      const thing = formData.get(`serviceDetails[goodThings][${i}]`);
      if (!thing) break;
      serviceDetails.goodThings.push(thing);
    }

    // 12. compareAndChoose
    for (let i = 0; i < 20; i++) {
      const compare = formData.get(`serviceDetails[compareAndChoose][${i}]`);
      if (!compare) break;
      serviceDetails.compareAndChoose.push(compare);
    }

    // 13. companyDetails
    for (let i = 0; i < 20; i++) {
      const name = formData.get(`serviceDetails[companyDetails][${i}][name]`);
      if (!name) break;

      const company: any = {
        name: name,
        location: formData.get(`serviceDetails[companyDetails][${i}][location]`) || "",
        details: []
      };

      // Process details
      for (let j = 0; j < 20; j++) {
        const title = formData.get(`serviceDetails[companyDetails][${i}][details][${j}][title]`);
        if (!title) break;
        company.details.push({
          title: title,
          description: formData.get(`serviceDetails[companyDetails][${i}][details][${j}][description]`) || ""
        });
      }

      serviceDetails.companyDetails.push(company);
    }

    // 14. roi
    for (let i = 0; i < 20; i++) {
      const roiItem = formData.get(`serviceDetails[roi][${i}]`);
      if (!roiItem) break;
      serviceDetails.roi.push(roiItem);
    }

    // 15. level
    const level = formData.get("serviceDetails[level]");
    if (level && ["beginner", "medium", "advanced"].includes(level.toString())) {
      serviceDetails.level = level;
    }

    // 16. lessonCount
    const lessonCount = formData.get("serviceDetails[lessonCount]");
    if (lessonCount) serviceDetails.lessonCount = Number(lessonCount);

    // 17. duration
    const weeks = formData.get("serviceDetails[duration][weeks]");
    const hours = formData.get("serviceDetails[duration][hours]");
    if (weeks) serviceDetails.duration.weeks = Number(weeks);
    if (hours) serviceDetails.duration.hours = Number(hours);

    // 18. whatYouWillLearn
    for (let i = 0; i < 20; i++) {
      const item = formData.get(`serviceDetails[whatYouWillLearn][${i}]`);
      if (!item) break;
      serviceDetails.whatYouWillLearn.push(item);
    }

    // 19. eligibleFor
    for (let i = 0; i < 20; i++) {
      const item = formData.get(`serviceDetails[eligibleFor][${i}]`);
      if (!item) break;
      serviceDetails.eligibleFor.push(item);
    }

    // 20. courseCurriculum
    for (let i = 0; i < 20; i++) {
      const title = formData.get(`serviceDetails[courseCurriculum][${i}][title]`);
      if (!title) break;

      const curriculum: any = {
        title: title,
        lists: [],
        model: []
      };

      // Process lists
      for (let j = 0; j < 20; j++) {
        const listItem = formData.get(`serviceDetails[courseCurriculum][${i}][lists][${j}]`);
        if (!listItem) break;
        curriculum.lists.push(listItem);
      }

      // Process model
      for (let j = 0; j < 20; j++) {
        const modelItem = formData.get(`serviceDetails[courseCurriculum][${i}][model][${j}]`);
        if (!modelItem) break;
        curriculum.model.push(modelItem);
      }

      serviceDetails.courseCurriculum.push(curriculum);
    }

    // 21. courseIncludes
    for (let i = 0; i < 20; i++) {
      const item = formData.get(`serviceDetails[courseIncludes][${i}]`);
      if (!item) break;
      serviceDetails.courseIncludes.push(item);
    }

    // 22. certificateImage
    for (const key of formData.keys()) {
      if (key.startsWith("serviceDetails[certificateImage]")) {
        const file = formData.get(key);
        if (file instanceof File) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const upload = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${file.name}`,
            folder: "/services/certificates",
          });
          serviceDetails.certificateImage.push(upload.url);
        }
      }
    }

    // 23. whomToSell
    for (let i = 0; i < 20; i++) {
      const lists = formData.get(`serviceDetails[whomToSell][${i}][lists]`);
      if (!lists) break;

      const iconFile = formData.get(`serviceDetails[whomToSell][${i}][icon]`);
      let iconUrl = "";
      if (iconFile instanceof File) {
        iconUrl = await handleFileUpload(iconFile, "/services/whomToSell");
      } else if (typeof iconFile === "string") {
        iconUrl = iconFile;
      }

      serviceDetails.whomToSell.push({
        icon: iconUrl,
        lists: lists.toString()
      });
    }

    // 24. include
    for (let i = 0; i < 20; i++) {
      const item = formData.get(`serviceDetails[include][${i}]`);
      if (!item) break;
      serviceDetails.include.push(item);
    }

    // 25. notInclude
    for (let i = 0; i < 20; i++) {
      const item = formData.get(`serviceDetails[notInclude][${i}]`);
      if (!item) break;
      serviceDetails.notInclude.push(item);
    }

    // 26. safetyAndAssurance
    for (let i = 0; i < 20; i++) {
      const item = formData.get(`serviceDetails[safetyAndAssurance][${i}]`);
      if (!item) break;
      serviceDetails.safetyAndAssurance.push(item);
    }

    // --- Franchise Details ---
    const franchiseDetails: any = {
      commission: formData.get("franchiseDetails[commission]"),
      termsAndConditions: formData.get("franchiseDetails[termsAndConditions]"),
      investmentRange: [],
      monthlyEarnPotential: [],
      franchiseModel: [],
      extraSections: [],
      extraImages: [],
    };

    for (let i = 0; i < 20; i++) {
  const range = formData.get(`franchiseDetails[investmentRange][${i}][range]`);
  if (!range) break;
  franchiseDetails.investmentRange.push({
    range,
    parameters: formData.get(`franchiseDetails[investmentRange][${i}][parameters]`) || "",
  });
}

   for (let i = 0; i < 20; i++) {
  const range = formData.get(`franchiseDetails[monthlyEarnPotential][${i}][range]`);
  if (!range) break;
  franchiseDetails.monthlyEarnPotential.push({
    range,
    parameters: formData.get(`franchiseDetails[monthlyEarnPotential][${i}][parameters]`) || "",
  });
}

    for (let i = 0; i < 20; i++) {
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

    // --- Franchise Extra Sections ---
    for (let i = 0; i < 20; i++) {
      const title = formData.get(`franchiseDetails[extraSections][${i}][title]`);
      if (!title) break;

      const extraSection: any = {
        title,
        subtitle: [],
        description: [],
        subDescription: [],
        lists: [],
        tags: [],
        image: [],
      };

      for (let j = 0; j < 20; j++) {
        const subtitle = formData.get(`franchiseDetails[extraSections][${i}][subtitle][${j}]`);
        if (!subtitle) break;
        extraSection.subtitle.push(subtitle);
      }

      for (let j = 0; j < 20; j++) {
        const description = formData.get(`franchiseDetails[extraSections][${i}][description][${j}]`);
        if (!description) break;
        extraSection.description.push(description);
      }

      for (let j = 0; j < 20; j++) {
        const subDescription = formData.get(`franchiseDetails[extraSections][${i}][subDescription][${j}]`);
        if (!subDescription) break;
        extraSection.subDescription.push(subDescription);
      }

      for (let j = 0; j < 20; j++) {
        const list = formData.get(`franchiseDetails[extraSections][${i}][lists][${j}]`);
        if (!list) break;
        extraSection.lists.push(list);
      }

      for (let j = 0; j < 20; j++) {
        const tag = formData.get(`franchiseDetails[extraSections][${i}][tags][${j}]`);
        if (!tag) break;
        extraSection.tags.push(tag);
      }

      for (let j = 0; j < 20; j++) {
        const imageFile = formData.get(`franchiseDetails[extraSections][${i}][image][${j}]`);
        if (imageFile instanceof File) {
          const buffer = Buffer.from(await imageFile.arrayBuffer());
          const upload = await imagekit.upload({
            file: buffer,
            fileName: `${uuidv4()}-${imageFile.name || "extra-section.png"}`,
            folder: "/services/franchiseExtraSections",
          });
          extraSection.image.push(upload.url);
        } else {
          break;
        }
      }

      franchiseDetails.extraSections.push(extraSection);
    }

    // --- Final Price Calculations ---
    const discountedPrice = discount ? Math.floor(price - price * (discount / 100)) : price;
    const gstInRupees = (discountedPrice * gst) / 100;
    const totalWithGst = discountedPrice + gstInRupees;

    // --- Save Service ---
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
  {
    success: true,
    message: "Service created successfully",
    data: newService,
  },
  { status: 201, headers: corsHeaders }
);

  } catch (err: any) {
    console.error("🔥 API ERROR:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500, headers: corsHeaders });
  }
}

const removeEmpty = (value: any): any => {
  // ✅ keep ObjectId & Date untouched
  if (
    value instanceof mongoose.Types.ObjectId ||
    value instanceof Date
  ) {
    return value;
  }

  // remove empty string
  if (value === "") return undefined;

  // handle arrays
  if (Array.isArray(value)) {
    const cleanedArray = value
      .map(removeEmpty)
      .filter(v => v !== undefined);

    return cleanedArray.length > 0 ? cleanedArray : undefined;
  }

  // handle objects
  if (typeof value === "object" && value !== null) {
    const cleanedObject: any = {};

    for (const key in value) {
      const cleanedValue = removeEmpty(value[key]);

      if (cleanedValue !== undefined) {
        cleanedObject[key] = cleanedValue;
      }
    }

    return Object.keys(cleanedObject).length > 0 ? cleanedObject : undefined;
  }

  // keep numbers, booleans, valid strings
  return value;
};



// NEW PAGINATION
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const sort = searchParams.get("sort");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : null;
    const skip = limit ? (page - 1) * limit : 0;

    const filter: Record<string, unknown> = { isDeleted: false };

    if (search) {
      filter.serviceName = { $regex: `\\b${search}[a-zA-Z]*`, $options: "i" };
    }

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;

    let sortOption: Record<string, 1 | -1> = {};

    switch (sort) {
      case "latest": sortOption = { createdAt: -1 }; break;
      case "oldest": sortOption = { createdAt: 1 }; break;
      case "ascending": sortOption = { serviceName: 1 }; break;
      case "descending": sortOption = { serviceName: -1 }; break;
      case "asc": sortOption = { price: 1 }; break;
      case "desc": sortOption = { price: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const total = await Service.countDocuments(filter);

    let query = Service.find(filter)
      .populate("category")
      .populate("subcategory")
      .populate({
        path: "providerPrices.provider",
        select: "fullName storeInfo.storeName storeInfo.logo",
      })
      .sort({ sortOrder: 1, ...sortOption })
      .lean(); // ✅ IMPORTANT

    if (limit) query = query.skip(skip).limit(limit);

    const services = await query.exec();

    /* ✅ CLEAN + SAFE RESPONSE */
    const cleanedServices = services
      .map(service => removeEmpty(service))
      .filter(Boolean);

    return NextResponse.json(
      {
        success: true,
        page: limit ? page : 1,
        limit: limit ?? total,
        total,
        totalPages: limit ? Math.ceil(total / limit) : 1,
        data: cleanedServices,
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





