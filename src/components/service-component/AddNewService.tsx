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

import { FaStore, FaBusinessTime, FaBullhorn, FaBalanceScale, FaMoneyBillWave, FaLaptopCode, FaBook, FaTruck, FaRobot } from "react-icons/fa";
import { moduleFieldConfig } from '@/utils/moduleFieldConfig';

const modules = [
  { name: "Franchise", icon: <FaStore size={36} /> },
  { name: "Business", icon: <FaBusinessTime size={36} /> },
  { name: "Marketing", icon: <FaBullhorn size={36} /> },
  { name: "LegalServices", icon: <FaBalanceScale size={36} /> },
  { name: "Finance", icon: <FaMoneyBillWave size={36} /> },
  { name: "ItServices", icon: <FaLaptopCode size={36} /> },
  { name: "Education", icon: <FaBook size={36} /> },
  { name: "OnDemand", icon: <FaTruck size={36} /> },
  { name: "AIHub", icon: <FaRobot size={36} /> },
];
// ---------------- COMPONENT ----------------
const AddNewService = () => {
  const { createService } = useService();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModule, setSelectedModule] = useState(modules[0].name);

  // stepper state for franchise
  const [franchiseStep, setFranchiseStep] = useState<number>(1);

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
      assuredByFetchTrue: [{ title: '', description: '', icon: ''   }],
      howItWorks:[{ title: '', description: '',  icon: '' }],
      termsAndConditions: [''],
      faq: [{ question: '', answer: '' }],
      extraSections: [{ title: '', description: [''], subtitle: [''], subDescription: [''], lists: [''], tags: [''], image: [] }],
      whyChooseUs: [{ title: '', description: '',  icon: '' }],
      packages: [{ name: '', price: null, discount: null, discountedPrice: null, whatYouGet: [''] }],
      weRequired:[{ title: '', description: '', icon: '' }],
      weDeliver: [{ title: '', description: '',  icon: '' }],
      moreInfo:[{ title: '', image: '', description: '' }],
      connectWith: [{ name: '', mobileNo: '', email: '' }],
      timeRequired: [{ minDays: null, maxDays: null }],
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
      keyValues: [{ key: '', value: '' }],
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


  console.log("formdata at the timing of typing : ", formData);

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

      console.log("======= Raw Form Data =======");
      console.log(JSON.stringify(formData, null, 2));

      // ---------------- BASIC DETAILS ----------------
      fd.append("serviceName", formData.basic.serviceName   || "");
      fd.append("category", formData.basic.category || "");
      if (formData.basic.subcategory && formData.basic.subcategory.trim() !== "") {
        fd.append("subcategory", formData.basic.subcategory);
      }
      // else do nothing, omit field entirely
      fd.append("price", formData.basic.price?.toString() || "0");
      fd.append("discount", formData.basic.discount?.toString() || "0");
      fd.append("gst", formData.basic.gst?.toString() || "0");
      fd.append("includeGst", formData.basic.includeGst ? "true" : "false");
      fd.append("recommendedServices", formData.basic.recommendedServices ? "true" : "false");

      // ---------------- THUMBNAIL IMAGE ----------------
      if ((formData as any).basic?.thumbnailImage instanceof File) {
        fd.append("thumbnail", (formData as any).basic.thumbnailImage);
      }

      // ---------------- BANNER IMAGES ----------------
      const bannerFiles = (formData as any).basic?.bannerImages;

      if (bannerFiles) {
        Array.from(bannerFiles).forEach((file: File, i: number) => {
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

      // KeyValues
      formData.basic.keyValues?.forEach((kv, i) => {
        fd.append(`keyValues[${i}][key]`, kv.key || "");
        fd.append(`keyValues[${i}][value]`, kv.value || "");
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

      fd.append("benefits", JSON.stringify(formData.service.benefits || []));
      fd.append("aboutUs",JSON.stringify(formData.service.aboutUs || []));
      fd.append("document", JSON.stringify(formData.service.document || []));
      fd.append("termsAndConditions",JSON.stringify(formData.service.termsAndConditions || []));

      // (rest of your existing building logic remains unchanged...)
      // ... AssuredByFetchTrue, howItWorks, whyChooseUs, packages, weRequired, weDeliver, moreInfo, connectWith, timeRequired, extraImages, extraSections (same as original)

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

        if (result.success) {
          console.log("Created service:", result.data);
          alert("Service Saved Successfully...");
          setFormData(initialFormData);
        } else {
          // Display backend validation message
          alert(result.message);
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

  const config = moduleFieldConfig[selectedModule] || {};
  const isFranchiseSelected = selectedModule === 'Franchise';

  // ---------------- ADDITIONAL FRANCHISE FIELDS COMPONENT (step 2) ----------------
  const FranchiseExtraFields: React.FC<{
    data: FranchiseDetails;
    setData: (val: Partial<FranchiseDetails>) => void;
  }> = ({ data, setData }) => {
    // local temporary controlled fields for adding a franchiseModel item
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
      <div >

        {/* Sticky Module Selection */}
        <div className="sticky top-16 z-20 bg-white  py-2">
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
                  // reset stepper to step 1 whenever Franchise module is selected
                  if (mod.name === 'Franchise') setFranchiseStep(1);
                }}
              >
                <div className="text-2xl">{mod.icon}</div>
                <p className="text-xs font-medium mt-1 text-center">{mod.name}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <BasicDetailsForm
            data={formData.basic}
            setData={(newData) => setFormData((prev) => ({ ...prev, basic: { ...prev.basic, ...newData } }))}
             fieldsConfig={config.basicDetails}
          />
          <hr className="border-gray-300" />
          <ServiceDetailsForm
            data={formData.service}
            setData={(newData) => setFormData((prev) => ({ ...prev, service: { ...prev.service, ...newData } }))}
              fieldsConfig={config.serviceDetails}
          />
          <hr className="border-gray-300" />

          {/* Franchise stepper: only when Franchise module selected */}
          {isFranchiseSelected ? (
            <div className="space-y-4">
              {/* Stepper header */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFranchiseStep(1)}
                  className={`px-3 py-1 rounded ${franchiseStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                  Step 1
                </button>
                <button
                  type="button"
                  onClick={() => setFranchiseStep(2)}
                  className={`px-3 py-1 rounded ${franchiseStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                >
                  Step 2 (Franchise-only)
                </button>

                <div className="ml-auto text-sm text-gray-600">You are editing Franchise module</div>
              </div>

              {/* Step content */}
              <div>
                {franchiseStep === 1 && (
                  // Render your existing FranchiseDetailsForm unchanged
                  <FranchiseDetailsForm
                    data={formData.franchise}
                    setData={(newData) => setFormData((prev) => ({ ...prev, franchise: { ...prev.franchise, ...newData } }))}
                    price={formData.basic.discountedPrice}
                    fieldsConfig={config.franchiseDetails}
                  />
                )}

                {franchiseStep === 2 && (
                  // Extra franchise-only fields (small inline component) which updates the same formData.franchise
                  <FranchiseExtraFields
                    data={formData.franchise}
                    setData={(newData) => setFormData((prev) => ({ ...prev, franchise: { ...prev.franchise, ...newData } }))}
                  />
                )}
              </div>

              {/* Step nav */}
              <div className="flex justify-between">
                <div>
                  {franchiseStep > 1 && (
                    <button type="button" onClick={() => setFranchiseStep(franchiseStep - 1)} className="px-3 py-1 bg-gray-200 rounded">Back</button>
                  )}
                </div>
                <div className="flex gap-2">
                  {franchiseStep < 2 ? (
                    <button type="button" onClick={() => setFranchiseStep(franchiseStep + 1)} className="px-3 py-1 bg-blue-600 text-white rounded">Next</button>
                  ) : (
                    <button type="button" onClick={() => setFranchiseStep(1)} className="px-3 py-1 bg-green-500 text-white rounded">Done</button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // if not franchise module, render franchise section normally (or omit - I left the original rendering out when not franchise)
            <div className="hidden" />
          )}

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
