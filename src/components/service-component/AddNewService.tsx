'use client';

import React, { useEffect, useState } from 'react';
import ComponentCard from '../common/ComponentCard';
import BasicDetailsForm from './BasicDetailsForm';
import ServiceDetailsForm from './ServiceDetailsForm';
import FranchiseDetailsForm from './FranchiseDetailsForm';
import { useService } from '@/context/ServiceContext';
import { FaStore, FaBusinessTime, FaBullhorn, FaBalanceScale, FaMoneyBillWave, FaLaptopCode, FaBook, FaTruck, FaRobot } from "react-icons/fa";
import { moduleFieldConfig } from '@/utils/moduleFieldConfig';
import FranchiseExtraDetails from './FranchiseExtraDetails';

// ---------------- TYPES ----------------
type KeyValue = { 
  key: string; 
  value: string; 
  icon?: File | string | null;
};

type RowData = { title: string; description: string[] };
type InvestmentRangeItem = {
  minRange: number | string;
  maxRange: number | string;
};
type MonthlyEarnItem = {
  minEarn: string | number;
  maxEarn: string | number;
};

type FranchiseModelItem = {
  title: string;
  agreement: string;
  price: string | number;
  discount: string | number;
  gst: string | number;
  fees: string | number;
};

type CounterItem = {
  number: number | string;
  title: string;
};

type FranchiseOperatingModelItem = {
  info: string;
  title: string;
  description: string;
  features: {
    icon: string;
    subtitle: string;
    subDescription: string;
  }[];
  tags: string[];
  example: string;
};

type BusinessFundamental = {
  description: string;
  points: {
    subtitle: string;
    subDescription: string;
  }[];
};

type KeyAdvantageItem = {
  icon: string;
  title: string;
  description: string;
};

type CompleteSupportSystemItem = {
  icon: string;
  title: string;
  lists: string[];
};

type CompanyDetailsItem = {
  name: string;
  location: string;
  details: {
    title: string;
    description: string;
  }[];
};

type CourseCurriculumItem = {
  title: string;
  lists: string[];
  model: string[];
};

type WhomToSellItem = {
  icon: string;
  lists: string;
};

type ExtraSection = {
  title: string;
  subtitle: string[];
  image: string[];
  description: string[];
  subDescription: string[];
  lists: string[];
  tags: string[];
};
type FAQ = { question: string; answer: string };
type TitleDescription = { title: string; description: string; icon?: string };

type Package = { name: string; price: number | null; discount: number | null; discountedPrice: number | null; whatYouGet: string[] };
type MoreInfo = { title: string; image: string; description: string };
type ExtraImageItem = { file: File; previewUrl: string,  icon: string; };
type ConnectWith = { name: string; mobileNo: string; email: string };
type TimeRequired = { minDays: number | null; maxDays: number | null };

type BasicDetailsData = {
  serviceName ?: string;
  category?: string;
  subcategory?: string;
  price?: number;
  discount?: number;
  discountedPrice?: number;
  gst?: number;
  includeGst?: boolean;
  gstInRupees?: number;
  totalWithGst?: number;
  thumbnail?: File | null;
  covers?: FileList | File[] | null;
  tags?: string[];
  keyValues?: KeyValue[];
  recommendedServices?: boolean;
};

export type ServiceDetails = {
  benefits: string[];
  aboutUs: string[];
  highlight: string[];
  highlightPreviews?: string[];
  document: string[];
  assuredByFetchTrue: TitleDescription[];
  howItWorks: TitleDescription[];
  termsAndConditions: string[];
  faq: FAQ[];
  extraSections: ExtraSection[];
  whyChooseUs: TitleDescription[];
  packages: Package[];
  weRequired: TitleDescription[];
  weDeliver: TitleDescription[];
  moreInfo: MoreInfo[];
  connectWith: ConnectWith[];
  timeRequired: TimeRequired[];
  extraImages: ExtraImageItem[];
  
  // NEW EXTENDED FIELDS
  operatingCities: string[];
  brochureImage: (File | string)[];
  emiavalable: string[];
  counter: CounterItem[];
  franchiseOperatingModel: FranchiseOperatingModelItem[];
  businessFundamental: BusinessFundamental;
  keyAdvantages: KeyAdvantageItem[];
  completeSupportSystem: CompleteSupportSystemItem[];
  trainingDetails: string[];
  agreementDetails: string[];
  goodThings: string[];
  compareAndChoose: string[];
  companyDetails: CompanyDetailsItem[];
  roi: string[];
  level: "beginner" | "medium" | "advanced";
  lessonCount: number | null;
  duration: {
    weeks: number | null;
    hours: number | null;
  };
  whatYouWillLearn: string[];
  eligibleFor: string[];
  courseCurriculum: CourseCurriculumItem[];
  courseIncludes: string[];
  certificateImage: (File | string)[];
  whomToSell: WhomToSellItem[];
  include: string[];
  notInclude: string[];
  safetyAndAssurance: string[];
};

type FranchiseDetails = {
  commission?: string;
  commissionType?: 'percentage' | 'amount';
  howItWorks?: string;
  termsAndConditions?: string;
  rows?: RowData[];
  investmentRange?: InvestmentRangeItem[];
  monthlyEarnPotential?: MonthlyEarnItem[];
  franchiseModel?: FranchiseModelItem[];
  extraSections?: ExtraSection[];
  extraImages?: (File | string)[];
};

type FormDataType = {
  basic: BasicDetailsData;
  service: ServiceDetails;
  franchise: FranchiseDetails;
};

const modules = [
  { _id: "68b2caf72ff3f8a31bf7bb8f", name: "Franchise", icon: <FaStore size={36} /> },
  { _id: "6822dfbce8235364b35df19f", name: "Business", icon: <FaBusinessTime size={36} /> },
  { _id: "6822dfd5e8235364b35df1a2", name: "Marketing", icon: <FaBullhorn size={36} /> },
  { _id: "6822dfefe8235364b35df1a5", name: "LegalServices", icon: <FaBalanceScale size={36} /> },
  { _id: "6822e003e8235364b35df1a8", name: "Finance", icon: <FaMoneyBillWave size={36} /> },
  { _id: "6822e018e8235364b35df1ab", name: "ItServices", icon: <FaLaptopCode size={36} /> },
  { _id: "6822e02de8235364b35df1ae", name: "Education", icon: <FaBook size={36} /> },
  { _id: "6822e05ee8235364b35df1b1", name: "OnDemand", icon: <FaTruck size={36} /> },
  { _id: "6822e075e8235364b35df1b4", name: "AIHub", icon: <FaRobot size={36} /> },
];

// ---------------- COMPONENT ----------------
const AddNewService = () => {
  const { createService } = useService();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModule, setSelectedModule] = useState(modules[0].name);
  const [createdServiceId, setCreatedServiceId] = useState(null);
  const [franchiseStep, setFranchiseStep] = useState<number>(1);
  const [formKey, setFormKey] = useState(0);
  const [franchiseExtraKey, setFranchiseExtraKey] = useState(0);
  const [franchiseFormKey, setFranchiseFormKey] = useState(0);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>("68b2caf72ff3f8a31bf7bb8f");

  const [formData, setFormData] = useState<FormDataType>({
    basic: {
      serviceName: '',
      category: '',
      subcategory: '',
      price: 0,
      discount: 0,
      discountedPrice: 0,
      gst: 0,
      includeGst: false,
      thumbnail: null,
      covers: [],
      tags: [],
      keyValues: [{ key: '', value: '', icon: null }],
      recommendedServices: false,
    },
    service: {
      benefits: [''],
      aboutUs: [''],
      highlight: [''],
      document: [''],
      assuredByFetchTrue: [{ title: '', description: '', icon: '' }],
      howItWorks: [{ title: '', description: '', icon: '' }],
      termsAndConditions: [''],
      faq: [{ question: '', answer: '' }],
      extraSections: [{ title: '', description: [''], subtitle: [''], subDescription: [''], lists: [''], tags: [''], image: [] }],
      whyChooseUs: [{ title: '', description: '', icon: '' }],
      packages: [{ name: '', price: null, discount: null, discountedPrice: null, whatYouGet: [''] }],
      weRequired: [{ title: '', description: '', icon: '' }],
      weDeliver: [{ title: '', description: '', icon: '' }],
      moreInfo: [{ title: '', image: '', description: '' }],
      connectWith: [{ name: '', mobileNo: '', email: '' }],
      timeRequired: [{ minDays: null, maxDays: null }],
      extraImages: [],
      
      // NEW EXTENDED FIELDS INITIAL VALUES
      operatingCities: [''],
      brochureImage: [],
      emiavalable: [''],
      counter: [{ number: '', title: '' }],
      franchiseOperatingModel: [{
        info: '',
        title: '',
        description: '',
        features: [{ icon: '', subtitle: '', subDescription: '' }],
        tags: [''],
        example: ''
      }],
      businessFundamental: {
        description: '',
        points: [{ subtitle: '', subDescription: '' }]
      },
      keyAdvantages: [{ icon: '', title: '', description: '' }],
      completeSupportSystem: [{ icon: '', title: '', lists: [''] }],
      trainingDetails: [''],
      agreementDetails: [''],
      goodThings: [''],
      compareAndChoose: [''],
      companyDetails: [{ name: '', location: '', details: [{ title: '', description: '' }] }],
      roi: [''],
      level: "beginner",
      lessonCount: null,
      duration: {
        weeks: null,
        hours: null
      },
      whatYouWillLearn: [''],
      eligibleFor: [''],
      courseCurriculum: [{ title: '', lists: [''], model: [''] }],
      courseIncludes: [''],
      certificateImage: [],
      whomToSell: [{ icon: '', lists: '' }],
      include: [''],
      notInclude: [''],
      safetyAndAssurance: ['']
    },
    franchise: {
      commission: '',
      commissionType: 'percentage',
      termsAndConditions: '',
      investmentRange: [],
      monthlyEarnPotential: [],
      franchiseModel: [],
      rows: [],
      extraSections: [{ title: '', description: [''], subtitle: [''], subDescription: [''], lists: [''], tags: [''], image: [] }],
      extraImages: [],
    },
  });

  // Define the initial empty state outside your component
  const initialFormData: FormDataType = {
    basic: {
      serviceName: '',
      category: '',
      subcategory: '',
      price: 0,
      discount: 0,
      discountedPrice: 0,
      gst: 0,
      includeGst: false,
      thumbnail: null,
      covers: [],
      tags: [],
      keyValues: [{ key: '', value: '', icon: null }],
      recommendedServices: false,
    },
    service: {
      benefits: [''],
      aboutUs: [''],
      highlight: [''],
      document: [''],
      assuredByFetchTrue: [{ title: '', description: '', icon: '' }],
      howItWorks: [{ title: '', description: '', icon: '' }],
      termsAndConditions: [''],
      faq: [{ question: '', answer: '' }],
      extraSections: [{ title: '', description: [''], subtitle: [''], subDescription: [''], lists: [''], tags: [''], image: [] }],
      whyChooseUs: [{ title: '', description: '', icon: '' }],
      packages: [{ name: '', price: null, discount: null, discountedPrice: null, whatYouGet: [''] }],
      weRequired: [{ title: '', description: '', icon: '' }],
      weDeliver: [{ title: '', description: '', icon: '' }],
      moreInfo: [{ title: '', image: '', description: '' }],
      connectWith: [{ name: '', mobileNo: '', email: '' }],
      timeRequired: [{ minDays: null, maxDays: null }],
      extraImages: [],
      
      // NEW EXTENDED FIELDS INITIAL VALUES
      operatingCities: [''],
      brochureImage: [],
      emiavalable: [''],
      counter: [{ number: '', title: '' }],
      franchiseOperatingModel: [{
        info: '',
        title: '',
        description: '',
        features: [{ icon: '', subtitle: '', subDescription: '' }],
        tags: [''],
        example: ''
      }],
      businessFundamental: {
        description: '',
        points: [{ subtitle: '', subDescription: '' }]
      },
      keyAdvantages: [{ icon: '', title: '', description: '' }],
      completeSupportSystem: [{ icon: '', title: '', lists: [''] }],
      trainingDetails: [''],
      agreementDetails: [''],
      goodThings: [''],
      compareAndChoose: [''],
      companyDetails: [{ name: '', location: '', details: [{ title: '', description: '' }] }],
      roi: [''],
      level: "beginner",
      lessonCount: null,
      duration: {
        weeks: null,
        hours: null
      },
      whatYouWillLearn: [''],
      eligibleFor: [''],
      courseCurriculum: [{ title: '', lists: [''], model: [''] }],
      courseIncludes: [''],
      certificateImage: [],
      whomToSell: [{ icon: '', lists: '' }],
      include: [''],
      notInclude: [''],
      safetyAndAssurance: ['']
    },
    franchise: {
      commission: '',
      commissionType: 'percentage',
      termsAndConditions: '',
      investmentRange: [],
      monthlyEarnPotential: [],
      franchiseModel: [],
      rows: [],
      extraSections: [{ title: '', description: [''], subtitle: [''], subDescription: [''], lists: [''], tags: [''], image: [] }],
      extraImages: [],
    },
  };

  // ---------------- Build FormData ----------------
  const buildFormData = (data: any, fd = new FormData(), parentKey = ''): FormData => {
    if (data && typeof data === 'object' && !(data instanceof File) && !(data instanceof Blob)) {
      Object.keys(data).forEach((key) => {
        const value = data[key];
        const fullKey = parentKey ? `${parentKey}[${key}]` : key;
        if (value !== undefined && value !== null) {
          buildFormData(value, fd, fullKey);
        }
      });
    } else if (data instanceof File || data instanceof Blob) {
      fd.append(parentKey, data);
    } else if (Array.isArray(data)) {
      data.forEach((item, index) => buildFormData(item, fd, `${parentKey}[${index}]`));
    } else if (typeof data === 'boolean') {
      fd.append(parentKey, data ? 'true' : 'false');
    } else if (typeof data === 'number' || typeof data === 'string') {
      fd.append(parentKey, data.toString());
    }
    return fd;
  };

  const resetForm = () => {
    // Reset parent state
    setFormData(initialFormData);
    setSelectedModule(modules[0].name);
    // setFranchiseStep(1);
    setCreatedServiceId(null);
    setIsSubmitting(false);

    // 🔥 FORCE REMOUNT (THIS IS THE FIX)
    setFormKey(prev => prev + 1);              // Basic + Service forms
    setFranchiseFormKey(prev => prev + 1);     // FranchiseDetailsForm (step-1)
    setFranchiseExtraKey(prev => prev + 1);    // FranchiseExtraDetails (step-2)
  };

  const config = moduleFieldConfig[selectedModule] || {};
  const isFranchiseSelected = selectedModule === "Franchise" || selectedModule === "Business";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
    }
  };

  // ---------------- Handle Submit ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fd = new FormData();

      // ---------------- BASIC DETAILS ----------------
      fd.append("serviceName", formData.basic.serviceName || "");
      fd.append("category", formData.basic.category || "");
      if (formData.basic.subcategory && formData.basic.subcategory.trim() !== "") {
        fd.append("subcategory", formData.basic.subcategory);
      }
      fd.append("price", formData.basic.price?.toString() || "0");
      fd.append("discount", formData.basic.discount?.toString() || "0");
      fd.append("gst", formData.basic.gst?.toString() || "0");
      fd.append("includeGst", formData.basic.includeGst ? "true" : "false");
      fd.append("recommendedServices", formData.basic.recommendedServices ? "true" : "false");

      // ---------------- THUMBNAIL IMAGE ----------------
      if (formData.basic.thumbnailImage instanceof File) {
        fd.append("thumbnail", formData.basic.thumbnailImage);
      }

      // ---------------- BANNER IMAGES ----------------
      const bannerFiles = formData.basic.bannerImages;
      if (bannerFiles) {
        Array.from(bannerFiles).forEach((file, i) => {
          if (file instanceof File) {
            fd.append(`bannerImages[${i}]`, file);
          }
        });
      }

      // ---------------- TAGS ----------------
      if (Array.isArray(formData.basic.tags)) {
        formData.basic.tags.forEach((tag, i) => {
          fd.append(`tags[${i}]`, tag || "");
        });
      }

      // ---------------- KEY VALUES ----------------
      if (formData.basic.keyValues) {
        for (let i = 0; i < formData.basic.keyValues.length; i++) {
          const kv = formData.basic.keyValues[i];
          fd.append(`keyValues[${i}][key]`, kv.key || "");
          fd.append(`keyValues[${i}][value]`, kv.value || "");
          
          if (kv.icon instanceof File) {
            fd.append(`keyValues[${i}][icon]`, kv.icon);
          } else {
            fd.append(`keyValues[${i}][icon]`, "");
          }
        }
      }

      // ---------------- SERVICE DETAILS ----------------
      fd.append("benefits", JSON.stringify(formData.service.benefits || []));
      fd.append("aboutUs", JSON.stringify(formData.service.aboutUs || []));
      fd.append("document", JSON.stringify(formData.service.document || []));
      fd.append("termsAndConditions", JSON.stringify(formData.service.termsAndConditions || []));

      // ---------------- HIGHLIGHT ----------------
      formData.service.highlight?.forEach((item, i) => {
        if (item instanceof File) {
          fd.append(`serviceDetails[highlight][${i}]`, item);
        } else if (typeof item === "string") {
          fd.append(`serviceDetails[highlight][${i}]`, item);
        }
      });

      // ---------------- EXISTING SERVICE FIELDS ----------------
      // AssuredByFetchTrue
      await Promise.all(
        formData.service.assuredByFetchTrue.map(async (item, i) => {
          fd.append(`serviceDetails[assuredByFetchTrue][${i}][title]`, item.title || "");
          fd.append(`serviceDetails[assuredByFetchTrue][${i}][description]`, item.description || "");
          if (item.icon instanceof File) {
            fd.append(`serviceDetails[assuredByFetchTrue][${i}][icon]`, item.icon);
          } else if (typeof item.icon === "string" && item.icon.startsWith("blob:")) {
            const blob = await fetch(item.icon).then(res => res.blob());
            const file = new File([blob], `icon-${i}.png`, { type: blob.type });
            fd.append(`serviceDetails[assuredByFetchTrue][${i}][icon]`, file);
          }
        })
      );

      // HowItWorks
      await Promise.all(
        formData.service.howItWorks.map(async (item, i) => {
          fd.append(`serviceDetails[howItWorks][${i}][title]`, item.title || "");
          fd.append(`serviceDetails[howItWorks][${i}][description]`, item.description || "");
          if (item.icon instanceof File) {
            fd.append(`serviceDetails[howItWorks][${i}][icon]`, item.icon);
          } else if (typeof item.icon === "string" && item.icon.startsWith("blob:")) {
            const blob = await fetch(item.icon).then(res => res.blob());
            const file = new File([blob], `icon-${i}.png`, { type: blob.type });
            fd.append(`serviceDetails[howItWorks][${i}][icon]`, file);
          }
        })
      );

      // FAQ
      formData.service.faq?.forEach((item, i) => {
        fd.append(`serviceDetails[faq][${i}][question]`, item.question || "");
        fd.append(`serviceDetails[faq][${i}][answer]`, item.answer || "");
      });

      // WhyChooseUs
      await Promise.all(
        formData.service.whyChooseUs.map(async (item, i) => {
          fd.append(`serviceDetails[whyChooseUs][${i}][title]`, item.title || "");
          fd.append(`serviceDetails[whyChooseUs][${i}][description]`, item.description || "");
          if (item.icon instanceof File) {
            fd.append(`serviceDetails[whyChooseUs][${i}][icon]`, item.icon);
          } else if (typeof item.icon === "string" && item.icon.startsWith("blob:")) {
            const blob = await fetch(item.icon).then(res => res.blob());
            const file = new File([blob], `icon-${i}.png`, { type: blob.type });
            fd.append(`serviceDetails[whyChooseUs][${i}][icon]`, file);
          }
        })
      );

      // Packages
      formData.service.packages?.forEach((item, i) => {
        fd.append(`serviceDetails[packages][${i}][name]`, item.name || "");
        fd.append(`serviceDetails[packages][${i}][price]`, item.price?.toString() || "");
        fd.append(`serviceDetails[packages][${i}][discount]`, item.discount?.toString() || "");
        fd.append(`serviceDetails[packages][${i}][discountedPrice]`, item.discountedPrice?.toString() || "");
        item.whatYouGet?.forEach((v, j) => {
          fd.append(`serviceDetails[packages][${i}][whatYouGet][${j}]`, v || "");
        });
      });

      // WeRequired
      await Promise.all(
        formData.service.weRequired.map(async (item, i) => {
          fd.append(`serviceDetails[weRequired][${i}][title]`, item.title || "");
          fd.append(`serviceDetails[weRequired][${i}][description]`, item.description || "");
          if (item.icon instanceof File) {
            fd.append(`serviceDetails[weRequired][${i}][icon]`, item.icon);
          } else if (typeof item.icon === "string" && item.icon.startsWith("blob:")) {
            const blob = await fetch(item.icon).then(res => res.blob());
            const file = new File([blob], `icon-${i}.png`, { type: blob.type });
            fd.append(`serviceDetails[weRequired][${i}][icon]`, file);
          }
        })
      );

      // WeDeliver
      await Promise.all(
        formData.service.weDeliver.map(async (item, i) => {
          fd.append(`serviceDetails[weDeliver][${i}][title]`, item.title || "");
          fd.append(`serviceDetails[weDeliver][${i}][description]`, item.description || "");
          if (item.icon instanceof File) {
            fd.append(`serviceDetails[weDeliver][${i}][icon]`, item.icon);
          } else if (typeof item.icon === "string" && item.icon.startsWith("blob:")) {
            const blob = await fetch(item.icon).then(res => res.blob());
            const file = new File([blob], `icon-${i}.png`, { type: blob.type });
            fd.append(`serviceDetails[weDeliver][${i}][icon]`, file);
          }
        })
      );

      // MoreInfo
      await Promise.all(
        formData.service.moreInfo.map(async (item, i) => {
          fd.append(`serviceDetails[moreInfo][${i}][title]`, item.title || "");
          fd.append(`serviceDetails[moreInfo][${i}][description]`, item.description || "");
          if (item.image instanceof File) {
            fd.append(`serviceDetails[moreInfo][${i}][image]`, item.image);
          } else if (typeof item.image === "string" && item.image.startsWith("blob:")) {
            const blob = await fetch(item.image).then(res => res.blob());
            const file = new File([blob], `image-${i}.png`, { type: blob.type });
            fd.append(`serviceDetails[moreInfo][${i}][image]`, file);
          }
        })
      );

      // ConnectWith
      formData.service.connectWith?.forEach((item, i) => {
        fd.append(`serviceDetails[connectWith][${i}][name]`, item.name || "");
        fd.append(`serviceDetails[connectWith][${i}][mobileNo]`, item.mobileNo || "");
        fd.append(`serviceDetails[connectWith][${i}][email]`, item.email || "");
      });

      // TimeRequired
      formData.service.timeRequired?.forEach((item, i) => {
        fd.append(`serviceDetails[timeRequired][${i}][minDays]`, item.minDays?.toString() || "");
        fd.append(`serviceDetails[timeRequired][${i}][maxDays]`, item.maxDays?.toString() || "");
      });

      // ---------------- Extra Images in Service ----------------
      if (Array.isArray(formData.service.extraImages)) {
        formData.service.extraImages.forEach((file, i) => {
          if (file instanceof File) {
            fd.append(`serviceDetails[extraImages][${i}]`, file);
          }
        });
      }

      // ---------------- EXTRA SECTIONS (SERVICE) ----------------
      if (Array.isArray(formData.service.extraSections)) {
        for (let i = 0; i < formData.service.extraSections.length; i++) {
          const section = formData.service.extraSections[i];
          fd.append(`serviceDetails[extraSections][${i}][title]`, section.title || "");
          section.subtitle?.forEach((v, j) =>
            fd.append(`serviceDetails[extraSections][${i}][subtitle][${j}]`, v || "")
          );
          section.description?.forEach((v, j) =>
            fd.append(`serviceDetails[extraSections][${i}][description][${j}]`, v || "")
          );
          section.subDescription?.forEach((v, j) =>
            fd.append(`serviceDetails[extraSections][${i}][subDescription][${j}]`, v || "")
          );
          section.lists?.forEach((v, j) =>
            fd.append(`serviceDetails[extraSections][${i}][lists][${j}]`, v || "")
          );
          section.tags?.forEach((v, j) =>
            fd.append(`serviceDetails[extraSections][${i}][tags][${j}]`, v || "")
          );
          // ✅ IMAGE ARRAY FIX
          if (Array.isArray(section.image)) {
            for (let j = 0; j < section.image.length; j++) {
              const img = section.image[j];
              if (img instanceof File) {
                fd.append(`serviceDetails[extraSections][${i}][image][${j}]`, img);
              } else if (typeof img === "string" && img.startsWith("blob:")) {
                const response = await fetch(img);
                const blob = await response.blob();
                const file = new File([blob], `extra-section-${i}-${j}.png`, { type: blob.type });
                fd.append(`serviceDetails[extraSections][${i}][image][${j}]`, file);
              }
            }
          }
        }
      }

      // ---------------- NEW EXTENDED FIELDS ----------------
      
      // 1. operatingCities
      formData.service.operatingCities?.forEach((city, i) => {
        fd.append(`serviceDetails[operatingCities][${i}]`, city || "");
      });

      // 2. brochureImage
      formData.service.brochureImage?.forEach((file, i) => {
        if (file instanceof File) {
          fd.append(`serviceDetails[brochureImage][${i}]`, file);
        }
      });

      // 3. emiavalable
     formData.service.emiavalable?.forEach((emi, i) => {
  fd.append(`serviceDetails[emiavalable][${i}]`, emi || "");  // Note: emiavalable
});

      // 4. counter
      formData.service.counter?.forEach((item, i) => {
        fd.append(`serviceDetails[counter][${i}][number]`, item.number?.toString() || "");
        fd.append(`serviceDetails[counter][${i}][title]`, item.title || "");
      });

      // 5. franchiseOperatingModel
      formData.service.franchiseOperatingModel?.forEach((model, i) => {
        fd.append(`serviceDetails[franchiseOperatingModel][${i}][info]`, model.info || "");
        fd.append(`serviceDetails[franchiseOperatingModel][${i}][title]`, model.title || "");
        fd.append(`serviceDetails[franchiseOperatingModel][${i}][description]`, model.description || "");
        
        // Features
        model.features?.forEach((feature, j) => {
          fd.append(`serviceDetails[franchiseOperatingModel][${i}][features][${j}][subtitle]`, feature.subtitle || "");
          fd.append(`serviceDetails[franchiseOperatingModel][${i}][features][${j}][subDescription]`, feature.subDescription || "");
          if (feature.icon instanceof File) {
            fd.append(`serviceDetails[franchiseOperatingModel][${i}][features][${j}][icon]`, feature.icon);
          } else if (typeof feature.icon === "string") {
            fd.append(`serviceDetails[franchiseOperatingModel][${i}][features][${j}][icon]`, feature.icon);
          }
        });

        // Tags
        model.tags?.forEach((tag, j) => {
          fd.append(`serviceDetails[franchiseOperatingModel][${i}][tags][${j}]`, tag || "");
        });

        fd.append(`serviceDetails[franchiseOperatingModel][${i}][example]`, model.example || "");
      });

      // 6. businessFundamental
      fd.append(`serviceDetails[businessFundamental][description]`, formData.service.businessFundamental?.description || "");
      formData.service.businessFundamental?.points?.forEach((point, i) => {
        fd.append(`serviceDetails[businessFundamental][points][${i}][subtitle]`, point.subtitle || "");
        fd.append(`serviceDetails[businessFundamental][points][${i}][subDescription]`, point.subDescription || "");
      });

      // 7. keyAdvantages
      formData.service.keyAdvantages?.forEach((item, i) => {
        fd.append(`serviceDetails[keyAdvantages][${i}][title]`, item.title || "");
        fd.append(`serviceDetails[keyAdvantages][${i}][description]`, item.description || "");
        if (item.icon instanceof File) {
          fd.append(`serviceDetails[keyAdvantages][${i}][icon]`, item.icon);
        } else if (typeof item.icon === "string") {
          fd.append(`serviceDetails[keyAdvantages][${i}][icon]`, item.icon);
        }
      });

      // 8. completeSupportSystem
      formData.service.completeSupportSystem?.forEach((item, i) => {
        fd.append(`serviceDetails[completeSupportSystem][${i}][title]`, item.title || "");
        if (item.icon instanceof File) {
          fd.append(`serviceDetails[completeSupportSystem][${i}][icon]`, item.icon);
        } else if (typeof item.icon === "string") {
          fd.append(`serviceDetails[completeSupportSystem][${i}][icon]`, item.icon);
        }
        item.lists?.forEach((list, j) => {
          fd.append(`serviceDetails[completeSupportSystem][${i}][lists][${j}]`, list || "");
        });
      });

      // 9. trainingDetails
      formData.service.trainingDetails?.forEach((detail, i) => {
        fd.append(`serviceDetails[trainingDetails][${i}]`, detail || "");
      });

      // 10. agreementDetails
      formData.service.agreementDetails?.forEach((detail, i) => {
        fd.append(`serviceDetails[agreementDetails][${i}]`, detail || "");
      });

      // 11. goodThings
      formData.service.goodThings?.forEach((thing, i) => {
        fd.append(`serviceDetails[goodThings][${i}]`, thing || "");
      });

      // 12. compareAndChoose
      formData.service.compareAndChoose?.forEach((item, i) => {
        fd.append(`serviceDetails[compareAndChoose][${i}]`, item || "");
      });

      // 13. companyDetails
      formData.service.companyDetails?.forEach((company, i) => {
        fd.append(`serviceDetails[companyDetails][${i}][name]`, company.name || "");
        fd.append(`serviceDetails[companyDetails][${i}][location]`, company.location || "");
        company.details?.forEach((detail, j) => {
          fd.append(`serviceDetails[companyDetails][${i}][details][${j}][title]`, detail.title || "");
          fd.append(`serviceDetails[companyDetails][${i}][details][${j}][description]`, detail.description || "");
        });
      });

      // 14. roi
      formData.service.roi?.forEach((item, i) => {
        fd.append(`serviceDetails[roi][${i}]`, item || "");
      });

      // 15. level
      fd.append(`serviceDetails[level]`, formData.service.level || "beginner");

      // 16. lessonCount
      if (formData.service.lessonCount !== null && formData.service.lessonCount !== undefined) {
        fd.append(`serviceDetails[lessonCount]`, formData.service.lessonCount.toString());
      }

      // 17. duration
      if (formData.service.duration?.weeks !== null && formData.service.duration?.weeks !== undefined) {
        fd.append(`serviceDetails[duration][weeks]`, formData.service.duration.weeks.toString());
      }
      if (formData.service.duration?.hours !== null && formData.service.duration?.hours !== undefined) {
        fd.append(`serviceDetails[duration][hours]`, formData.service.duration.hours.toString());
      }

      // 18. whatYouWillLearn
      formData.service.whatYouWillLearn?.forEach((item, i) => {
        fd.append(`serviceDetails[whatYouWillLearn][${i}]`, item || "");
      });

      // 19. eligibleFor
      formData.service.eligibleFor?.forEach((item, i) => {
        fd.append(`serviceDetails[eligibleFor][${i}]`, item || "");
      });

      // 20. courseCurriculum
      formData.service.courseCurriculum?.forEach((curriculum, i) => {
        fd.append(`serviceDetails[courseCurriculum][${i}][title]`, curriculum.title || "");
        curriculum.lists?.forEach((list, j) => {
          fd.append(`serviceDetails[courseCurriculum][${i}][lists][${j}]`, list || "");
        });
        curriculum.model?.forEach((model, j) => {
          fd.append(`serviceDetails[courseCurriculum][${i}][model][${j}]`, model || "");
        });
      });

      // 21. courseIncludes
      formData.service.courseIncludes?.forEach((item, i) => {
        fd.append(`serviceDetails[courseIncludes][${i}]`, item || "");
      });

      // 22. certificateImage
      formData.service.certificateImage?.forEach((file, i) => {
        if (file instanceof File) {
          fd.append(`serviceDetails[certificateImage][${i}]`, file);
        }
      });

      // 23. whomToSell
      formData.service.whomToSell?.forEach((item, i) => {
        fd.append(`serviceDetails[whomToSell][${i}][lists]`, item.lists || "");
        if (item.icon instanceof File) {
          fd.append(`serviceDetails[whomToSell][${i}][icon]`, item.icon);
        } else if (typeof item.icon === "string") {
          fd.append(`serviceDetails[whomToSell][${i}][icon]`, item.icon);
        }
      });

      // 24. include
      formData.service.include?.forEach((item, i) => {
        fd.append(`serviceDetails[include][${i}]`, item || "");
      });

      // 25. notInclude
      formData.service.notInclude?.forEach((item, i) => {
        fd.append(`serviceDetails[notInclude][${i}]`, item || "");
      });

      // 26. safetyAndAssurance
      formData.service.safetyAndAssurance?.forEach((item, i) => {
        fd.append(`serviceDetails[safetyAndAssurance][${i}]`, item || "");
      });

      // ---------------- FRANCHISE DETAILS ----------------
      fd.append("franchiseDetails[commission]", formData.franchise.commission || "");
      fd.append("franchiseDetails[termsAndConditions]", formData.franchise.termsAndConditions || "");

      formData.franchise.investmentRange?.forEach((item, i) => {
        fd.append(`franchiseDetails[investmentRange][${i}][minRange]`, item.minRange?.toString() || "");
        fd.append(`franchiseDetails[investmentRange][${i}][maxRange]`, item.maxRange?.toString() || "");
      });

      formData.franchise.monthlyEarnPotential?.forEach((item, i) => {
        fd.append(`franchiseDetails[monthlyEarnPotential][${i}][minEarn]`, item.minEarn?.toString() || "");
        fd.append(`franchiseDetails[monthlyEarnPotential][${i}][maxEarn]`, item.maxEarn?.toString() || "");
      });

      formData.franchise.franchiseModel?.forEach((model, i) => {
        fd.append(`franchiseDetails[franchiseModel][${i}][title]`, model.title || "");
        fd.append(`franchiseDetails[franchiseModel][${i}][agreement]`, model.agreement || "");
        fd.append(`franchiseDetails[franchiseModel][${i}][price]`, model.price?.toString() || "");
        fd.append(`franchiseDetails[franchiseModel][${i}][discount]`, model.discount?.toString() || "");
        fd.append(`franchiseDetails[franchiseModel][${i}][gst]`, model.gst?.toString() || "");
        fd.append(`franchiseDetails[franchiseModel][${i}][fees]`, model.fees?.toString() || "");
      });

      formData.franchise.extraSections?.forEach((section, i) => {
        fd.append(`franchiseDetails[extraSections][${i}][title]`, section.title || "");
        section.subtitle?.forEach((v, j) =>
          fd.append(`franchiseDetails[extraSections][${i}][subtitle][${j}]`, v || "")
        );
        section.description?.forEach((v, j) =>
          fd.append(`franchiseDetails[extraSections][${i}][description][${j}]`, v || "")
        );
        section.subDescription?.forEach((v, j) =>
          fd.append(`franchiseDetails[extraSections][${i}][subDescription][${j}]`, v || "")
        );
        section.lists?.forEach((v, j) =>
          fd.append(`franchiseDetails[extraSections][${i}][lists][${j}]`, v || "")
        );
        section.tags?.forEach((v, j) =>
          fd.append(`franchiseDetails[extraSections][${i}][tags][${j}]`, v || "")
        );
        section.image?.forEach((file, j) =>
          fd.append(`franchiseDetails[extraSections][${i}][image][${j}]`, file)
        );
      });

      formData.franchise.extraImages?.forEach((file, i) => {
        if (file instanceof File) {
          fd.append(`franchiseDetails[extraImages][${i}]`, file);
        }
      });

      // ---------------- CREATE SERVICE ----------------
      try {
        const result = await createService(fd);
        setCreatedServiceId(result?.data?._id);
        if (result.success) {
          if (isFranchiseSelected && franchiseStep === 1) {
            // 👉 Only move to next step after successful save
            alert("Step-1 Saved Successfully...");
            setFranchiseStep(2);
          } else {
            alert("Service Saved Successfully...");
            // reset parent state
            resetForm();
            // force remount all child components
            setFormKey(prev => prev + 1);
          }
        } else {
          // Display backend validation message
          alert("Service Save Successfully...");
          console.error("Service creation failed:", result.message);
        }
      } catch (error: any) {
        console.error("Error creating service:", error);
        alert(error?.message || "An error occurred while saving the service.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- ADDITIONAL FRANCHISE FIELDS COMPONENT (step 2) ----------------
  const FranchiseExtraFields: React.FC<{
    data: FranchiseDetails;
    setData: (val: Partial<FranchiseDetails>) => void;
  }> = ({ data, setData }) => {
    const [model, setModel] = useState<Partial<FranchiseModelItem>>({
      title: '',
      agreement: '',
      price: '',
      discount: '',
      gst: '',
      fees: ''
    });

    const addModel = () => {
      const arr = data.franchiseModel ? [...data.franchiseModel] : [];
      arr.push({
        title: model.title || '',
        agreement: model.agreement || '',
        price: model.price || '',
        discount: model.discount || 0,
        gst: model.gst || 0,
        fees: model.fees || 0,
      } as FranchiseModelItem);
      setData({ ...data, franchiseModel: arr });
      setModel({ title: '', agreement: '', price: '', discount: '', gst: '', fees: '' });
    };

    const removeModel = (idx: number) => {
      const arr = (data.franchiseModel || []).filter((_, i) => i !== idx);
      setData({ ...data, franchiseModel: arr });
    };

    const handleExtraImages = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const arr = data.extraImages ? [...data.extraImages] : [];
      for (let i = 0; i < files.length; i++) {
        arr.push(files[i]);
      }
      setData({ ...data, extraImages: arr });
    };
    
    return (
      <div className="border p-4 rounded space-y-4">
        <h3 className="font-semibold">Franchise - Extra Fields</h3>
        <div>
          <label className="block text-sm font-medium">Add Franchise Model</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <input value={model.title} onChange={(e)=>setModel({...model, title: e.target.value})} placeholder="Title" className="p-2 border rounded" />
            <input value={model.agreement} onChange={(e)=>setModel({...model, agreement: e.target.value})} placeholder="Agreement" className="p-2 border rounded" />
            <input value={model.price as any} onChange={(e)=>setModel({...model, price: e.target.value})} placeholder="Price" className="p-2 border rounded" />
            <input value={model.discount as any} onChange={(e)=>setModel({...model, discount: e.target.value})} placeholder="Discount" className="p-2 border rounded" />
            <input value={model.gst as any} onChange={(e)=>setModel({...model, gst: e.target.value})} placeholder="GST" className="p-2 border rounded" />
            <input value={model.fees as any} onChange={(e)=>setModel({...model, fees: e.target.value})} placeholder="Fees" className="p-2 border rounded" />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={addModel} className="px-3 py-1 bg-blue-600 text-white rounded">Add Model</button>
          </div>
          {/* list existing models */}
          <div className="mt-3">
            {(data.franchiseModel || []).map((m, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 border rounded mb-2">
                <div>
                  <div className="text-sm font-medium">{m.title}</div>
                  <div className="text-xs text-gray-600">Price: {m.price} • Agreement: {m.agreement}</div>
                </div>
                <button type="button" onClick={()=>removeModel(idx)} className="text-red-600 text-sm">Remove</button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Extra Images (franchise)</label>
          <input type="file" multiple onChange={handleExtraImages} className="mt-2" />
          <div className="mt-2">
            {(data.extraImages || []).map((f, i) => (
              <div key={i} className="text-xs">{(f as File).name || String(f)}</div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ---------------- RENDER ----------------
  return (
    <div>
      <ComponentCard title="Add New Service">
        <div>
          {/* Sticky Module Selection */}
          <div className="sticky top-16 z-20 bg-white py-2">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3 mb-4">
              {modules.map((mod) => (
                <div
                  key={mod.name}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer border transition-all duration-200 
                  ${selectedModule === mod.name 
                    ? "bg-blue-500 text-white border-blue-600" 
                    : "bg-white text-gray-700 hover:bg-gray-100"}`}
                  onClick={() => {
                    setSelectedModule(mod.name);
                    setSelectedModuleId(mod._id);
                    if (mod.name === 'Franchise') setFranchiseStep(1);
                  }}
                >
                  <div className="text-2xl">{mod.icon}</div>
                  <p className="text-xs font-medium mt-1 text-center">{mod.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Franchise Stepper Header */}
          {isFranchiseSelected && (
            <div className="mb-6 border rounded-xl p-6 bg-white shadow-sm">
              {/* Stepper */}
              <div className="">
                <div className="flex items-center justify-center gap-6">
                  {/* STEP 1 */}
                  <div
                    onClick={() => setFranchiseStep(1)}
                    className={`flex items-center gap-3 px-5 py-3 rounded-full border cursor-pointer transition-all 
                      ${franchiseStep === 1 ? "bg-blue-600 text-white shadow-md border-blue-600" :
                      "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}
                    `}
                  >
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 border border-gray-400">
                      {franchiseStep > 1 ? "✓" : "1"}
                    </div>
                    <span className="font-medium">Franchise Basic Details</span>
                  </div>
                  {/* LINE */}
                  <div className="w-12 h-1 bg-gray-300"></div>
                  {/* STEP 2 */}
                  <div
                    onClick={() => {
                      if (!createdServiceId) {
                        alert("Please complete Step-1 and submit before going to Step-2.");
                        return;
                      }
                      setFranchiseStep(2);
                    }}
                    className={`flex items-center gap-3 px-5 py-3 rounded-full border cursor-pointer transition-all
                      ${franchiseStep === 2 ? "bg-blue-600 text-white shadow-md border-blue-600" :
                      "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}
                    `}
                  >
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 border border-gray-400">
                      2
                    </div>
                    <span className="font-medium">Franchise Extra Details</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <form
          key={formKey}
          onSubmit={handleSubmit}
          className="space-y-5"
          onKeyDown={handleKeyDown}
        >
          {isFranchiseSelected ? (
            // If franchise module is selected, show content based on step
            franchiseStep === 1 ? (
              // Step 1: Show all three forms
              <>
                <BasicDetailsForm
                  data={formData.basic}
                  setData={(newData) => setFormData((prev) => ({ ...prev, basic: { ...prev.basic, ...newData } }))}
                  selectedModuleId={selectedModuleId}
                  fieldsConfig={config.basicDetails}
                />
                <hr className="border-gray-300" />
                <ServiceDetailsForm
                  data={formData.service}
                  setData={(newData) => setFormData((prev) => ({ ...prev, service: { ...prev.service, ...newData } }))}
                  fieldsConfig={config.serviceDetails}
                />
                <hr className="border-gray-300" />
                <FranchiseDetailsForm
                  key={franchiseFormKey}
                  data={formData.franchise}
                  setData={(newData) =>
                    setFormData(prev => ({
                      ...prev,
                      franchise: { ...prev.franchise, ...newData },
                    }))
                  }
                  price={formData.basic.discountedPrice}
                  fieldsConfig={config.franchiseDetails}
                />
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="ml-auto px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </>
            ) : (
              <FranchiseExtraDetails
                key={franchiseExtraKey}
                serviceId={createdServiceId}
                onSave={() => {
                  alert("Service Saved Successfully...");
                  resetForm();
                }}
              />
            )
          ) : (
            // Non-franchise modules
            <>
              <BasicDetailsForm
                data={formData.basic}
                setData={(newData) => setFormData((prev) => ({ ...prev, basic: { ...prev.basic, ...newData } }))}
                selectedModuleId={selectedModuleId}
                fieldsConfig={config.basicDetails}
              />
              <hr className="border-gray-300" />
              <ServiceDetailsForm
                data={formData.service}
                setData={(newData) => setFormData((prev) => ({ ...prev, service: { ...prev.service, ...newData } }))}
                fieldsConfig={config.serviceDetails}
              />
              <hr className="border-gray-300" />
              <FranchiseDetailsForm
                data={formData.franchise}
                setData={(newData) => setFormData((prev) => ({ ...prev, franchise: { ...prev.franchise, ...newData } }))}
                price={formData.basic.discountedPrice}
                fieldsConfig={config.franchiseDetails}
              />
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-auto px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </>
          )}
        </form>
      </ComponentCard>
    </div>
  );
};

export default AddNewService;