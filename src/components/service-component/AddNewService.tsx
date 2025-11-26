'use client';

import React, { useState } from 'react';
import ComponentCard from '../common/ComponentCard';
import BasicDetailsForm from './BasicDetailsForm';
import ServiceDetailsForm from './ServiceDetailsForm';
import FranchiseDetailsForm from './FranchiseDetailsForm';
import { useService } from '@/context/ServiceContext';

// ---------------- TYPES ----------------
type KeyValue = { key: string; value: string };
type RowData = { title: string; description: string[] };
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
  extraImages: string[];
};

type FranchiseDetails = {
  commission?: string;
  commissionType?: 'percentage' | 'amount';
  overview?: string;
  howItWorks?: string;
  termsAndConditions?: string;
  rows?: RowData[];
  investmentRange?: string[];
  monthlyEarnPotential?: string[];
  franchiseModel?: string[];
  extraSections?: ExtraSection[];
  extraImages?: (File | string)[];
};

type FormDataType = {
  basic: BasicDetailsData;
  service: ServiceDetails;
  franchise: FranchiseDetails;
};

// ---------------- COMPONENT ----------------
const AddNewService = () => {
  const { createService } = useService();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    basic: {
      serviceName : '',
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
      keyValues: [{ key: '', value: '' }],
      recommendedServices: false,
    },
    service: {
      benefits: [''],
      aboutUs: [''],
      highlight: [''],
      document: [''],
      assuredByFetchTrue: [''],
      howItWorks: [''],
      termsAndConditions: [''],
      faq: [{ question: '', answer: '' }],
      extraSections: [{ title: '', description: [''], subtitle: [''], subDescription: [''], lists: [''], tags: [''], image: [] }],
      whyChooseUs: [''],
      packages: [''],
      weRequired: [''],
      weDeliver: [''],
      moreInfo: [''],
      connectWith: [''],
      timeRequired: [''],
      extraImages: [],
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

  // ---------------- Handle Submit ----------------
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const fd = new FormData();

    // ---------------- BASIC DETAILS ----------------
    fd.append("serviceName", formData.basic.serviceName   || "");
    fd.append("category", formData.basic.category || "");
    fd.append("subcategory", formData.basic.subcategory || "");
    fd.append("price", formData.basic.price?.toString() || "0");
    fd.append("discount", formData.basic.discount?.toString() || "0");
    fd.append("gst", formData.basic.gst?.toString() || "0");
    fd.append("includeGst", formData.basic.includeGst ? "true" : "false");
    fd.append("recommendedServices", formData.basic.recommendedServices ? "true" : "false");

    if (formData.basic.thumbnail) {
      fd.append("thumbnailImage", formData.basic.thumbnail);
    }

    // KeyValues
    formData.basic.keyValues?.forEach((kv, i) => {
      fd.append(`keyValues[${i}][key]`, kv.key || "");
      fd.append(`keyValues[${i}][value]`, kv.value || "");
    });

    // Banner Images
    (formData.basic.covers || []).forEach((file, i) => {
      fd.append(`bannerImages[${i}]`, file);
    });

    // ---------------- SERVICE DETAILS ----------------
    Object.keys(formData.service).forEach((key) => {
      const value = (formData.service as any)[key];
      if (Array.isArray(value)) {
        value.forEach((v, i) => {
          if (v instanceof File) {
            fd.append(`serviceDetails[${key}][${i}]`, v);
          } else {
            fd.append(`serviceDetails[${key}][${i}]`, v || "");
          }
        });
      }
    });

    // Extra Sections inside Service
    formData.service.extraSections?.forEach((section, i) => {
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
      section.image?.forEach((file, j) =>
        fd.append(`serviceDetails[extraSections][${i}][image][${j}]`, file)
      );
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
      fd.append(`franchiseDetails[extraImages][${i}]`, file);
    });

    // ---------------- CREATE SERVICE ----------------
    const result = await createService(fd);
    console.log("Created service:", result);
  } catch (err) {
    console.error(err);
  } finally {
    setIsSubmitting(false);
  }
};

  // ---------------- RENDER ----------------
  return (
    <div>
      <ComponentCard title="Add New Service">
        <form onSubmit={handleSubmit} className="space-y-5">
          <BasicDetailsForm
            data={formData.basic}
            setData={(newData) => setFormData((prev) => ({ ...prev, basic: { ...prev.basic, ...newData } }))}
          />
          <hr className="border-gray-300" />
          <ServiceDetailsForm
            data={formData.service}
            setData={(newData) => setFormData((prev) => ({ ...prev, service: { ...prev.service, ...newData } }))}
          />
          <hr className="border-gray-300" />
          <FranchiseDetailsForm
            data={formData.franchise}
            setData={(newData) => setFormData((prev) => ({ ...prev, franchise: { ...prev.franchise, ...newData } }))}
            price={formData.basic.discountedPrice}
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
        </form>
      </ComponentCard>
    </div>
  );
};

export default AddNewService;
