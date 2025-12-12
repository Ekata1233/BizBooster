'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaStore, FaBusinessTime, FaBullhorn, FaBalanceScale, FaMoneyBillWave, FaLaptopCode, FaBook, FaTruck, FaRobot } from "react-icons/fa";

import { FranchiseDetails, useService } from '@/context/ServiceContext';
import BasicDetailsForm, { BasicDetailsData } from '@/components/service-component/BasicDetailsForm';
import ServiceDetailsForm, { ServiceDetails } from '@/components/service-component/ServiceDetailsForm';
import FranchiseDetailsForm from '@/components/service-component/FranchiseDetailsForm';
import ComponentCard from '@/components/common/ComponentCard';
import { moduleFieldConfig } from '@/utils/moduleFieldConfig';
import FranchiseExtraDetails from '@/components/service-component/FranchiseExtraDetails';

/**
 * Central "edit" shape. We keep types loose (any) in some places because
 * child components emit slightly different shapes; this keeps the page usable.
 */
type EditState = {
  basic: Partial<BasicDetailsData> & {
    // extras we use internally
    bannerPreviews?: string[];
    thumbnailPreview?: string;
  };
  service: Partial<ServiceDetails> & { highlight?: any[]; highlightPreviews?: string[] };
  franchise: FranchiseDetails; // FranchiseDetails shape lives inside FranchiseDetailsForm — keep flexible
};

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

const EditService: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { fetchSingleService, singleService: service, updateService } = useService();
  const [selectedModule, setSelectedModule] = useState(modules[0].name);
  const [createdServiceId, setCreatedServiceId] = useState(null);
  const [franchiseStep, setFranchiseStep] = useState<number>(1);
  const [state, setState] = useState<EditState>({
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
      bannerImages: [],
      bannerPreviews: [],
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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("state in edit form : ", state)

  // 1) Fetch single service on load
  useEffect(() => {
    if (!id) return;
    fetchSingleService(id as string);
  }, [id]);

  // 2) When service arrives, map fields into our state shape
  useEffect(() => {
    if (!service) return;

    const mappedBasic: any = {
      serviceName: service.serviceName || '',
      category: service.category?._id || '',
      subcategory: service.subcategory?._id || '',
      price: service.price ?? 0,
      discount: service.discount ?? 0,
      discountedPrice: service.discountedPrice ?? 0,
      gst: service.gst ?? 0,
      includeGst: service.includeGst ?? false,
      thumbnail: null,
      bannerImages: [],
      bannerPreviews: Array.isArray(service.bannerImages) ? service.bannerImages : [],
      tags: service.tags || [],
      keyValues: Array.isArray(service.keyValues) ? service.keyValues.map((kv: any) => ({ key: kv.key, value: kv.value })) : [{ key: '', value: '' }],
      recommendedServices: service.recommendedServices ?? false,
    };

    // Map service details (preserve arrays if already arrays; fallback to simple transforms)
    const svc = service.serviceDetails || {};
    const mappedService = {
      benefits: Array.isArray(svc.benefits) ? svc.benefits : [''],
      aboutUs: Array.isArray(svc.aboutUs) ? svc.aboutUs : [''],
      highlight: Array.isArray(svc.highlight) ? svc.highlight : [''],
      document: Array.isArray(svc.document) ? svc.document : [''],
      assuredByFetchTrue: Array.isArray(svc.assuredByFetchTrue) ? svc.assuredByFetchTrue : [{ title: '', description: '', icon: '' }],
      howItWorks: Array.isArray(svc.howItWorks) ? svc.howItWorks : [{ title: '', description: '', icon: '' }],
      termsAndConditions: Array.isArray(svc.termsAndConditions) ? svc.termsAndConditions : [''],
      faq: Array.isArray(svc.faq) ? svc.faq : [{ question: '', answer: '' }],
      extraSections: Array.isArray(svc.extraSections) ? svc.extraSections : [{ title: '', description: [''], subtitle: [''], subDescription: [''], lists: [''], tags: [''], image: [] }],
      whyChooseUs: Array.isArray(svc.whyChooseUs) ? svc.whyChooseUs : [{ title: '', description: '', icon: '' }],
      packages: Array.isArray(svc.packages) ? svc.packages : [{ name: '', price: null, discount: null, discountedPrice: null, whatYouGet: [''] }],
      weRequired: Array.isArray(svc.weRequired) ? svc.weRequired : [{ title: '', description: '', icon: '' }],
      weDeliver: Array.isArray(svc.weDeliver) ? svc.weDeliver : [{ title: '', description: '', icon: '' }],
      moreInfo: Array.isArray(svc.moreInfo) ? svc.moreInfo : [{ title: '', image: '', description: '' }],
      connectWith: Array.isArray(svc.connectWith) ? svc.connectWith : [{ name: '', mobileNo: '', email: '' }],
      timeRequired: Array.isArray(svc.timeRequired) ? svc.timeRequired : [{ minDays: null, maxDays: null }],
      extraImages: Array.isArray(svc.extraImages) ? svc.extraImages : [],
    };

    const fr = service.franchiseDetails || {};
    const mappedFranchise: any = {
      commission: fr.commission ?? '',
      commissionType: fr.commissionType ?? 'percentage',
      termsAndConditions: fr.termsAndConditions ?? '',
      investmentRange: fr.investmentRange ?? [],
      monthlyEarnPotential: fr.monthlyEarnPotential ?? [],
      franchiseModel: fr.franchiseModel ?? [],
      rows: fr.rows ?? [],
      extraSections: Array.isArray(fr.extraSections) ? fr.extraSections : [{ title: '', description: [''], subtitle: [''], subDescription: [''], lists: [''], tags: [''], image: [] }],
      extraImages: Array.isArray(fr.extraImages) ? fr.extraImages : [],
    };

    setState({
      basic: mappedBasic,
      service: mappedService,
      franchise: mappedFranchise,
    });
  }, [service]);

  // ---------- Child setData handlers ----------
  const onBasicSet = (newData: Partial<BasicDetailsData>) => {
    // normalize old 'covers' -> bannerImages if present (your BasicDetailsForm code used covers in the past)
    const normalized = { ...newData } as any;
    if ((normalized as any).covers instanceof FileList) {
      normalized.bannerImages = Array.from((normalized as any).covers as FileList);
      delete (normalized as any).covers;
    }
    setState(prev => ({ ...prev, basic: { ...prev.basic, ...normalized } }));
  };

  const onServiceSet = (newData: Partial<ServiceDetails> | any) => {
    setState(prev => ({ ...prev, service: { ...prev.service, ...newData } }));
  };

  const onFranchiseSet = (newData: any) => {
    setState(prev => ({ ...prev, franchise: { ...prev.franchise, ...newData } }));
  };

  // ---------- Build FormData and send update ----------
  const handleUpdate = async () => {
    if (!service) {
      alert('Service not loaded yet.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();

      // --- BASIC ---
      const b = state.basic;
      fd.append('serviceName', String(b.serviceName ?? ''));
      fd.append('category', String(b.category ?? ''));
      fd.append('subcategory', String(b.subcategory ?? ''));
      fd.append('price', String(b.price ?? 0));
      fd.append('discount', String(b.discount ?? 0));
      fd.append('gst', String(b.gst ?? 0));
      fd.append('includeGst', b.includeGst ? 'true' : 'false');
      fd.append('recommendedServices', b.recommendedServices ? 'true' : 'false');
      if (b.thumbnail instanceof File) fd.append('thumbnail', b.thumbnail);
      b.bannerImages?.forEach((file: File) => fd.append('bannerImages', file));
      b.tags?.forEach((tag, i) => fd.append(`tags[${i}]`, tag));
      b.keyValues?.forEach((kv, i) => {
        fd.append(`keyValues[${i}][key]`, kv.key ?? '');
        fd.append(`keyValues[${i}][value]`, kv.value ?? '');
      });

      // --- SERVICE ---
      const s = state.service;
      const appendJson = (key: string, value: any) => { if (value) fd.append(key, JSON.stringify(value)); };
      appendJson('serviceDetails[benefits]', s.benefits);
      appendJson('serviceDetails[aboutUs]', s.aboutUs);
      appendJson('serviceDetails[highlight]', s.highlight);
      appendJson('serviceDetails[document]', s.document);
      appendJson('serviceDetails[assuredByFetchTrue]', s.assuredByFetchTrue);
      appendJson('serviceDetails[howItWorks]', s.howItWorks);
      appendJson('serviceDetails[termsAndConditions]', s.termsAndConditions);
      appendJson('serviceDetails[faq]', s.faq);
      appendJson('serviceDetails[extraSections]', s.extraSections);
      appendJson('serviceDetails[whyChooseUs]', s.whyChooseUs);
      appendJson('serviceDetails[packages]', s.packages);
      appendJson('serviceDetails[weRequired]', s.weRequired);
      appendJson('serviceDetails[weDeliver]', s.weDeliver);
      appendJson('serviceDetails[moreInfo]', s.moreInfo);
      appendJson('serviceDetails[connectWith]', s.connectWith);
      appendJson('serviceDetails[timeRequired]', s.timeRequired);
      s.extraImages?.forEach((file: any) => {
        if (file instanceof File) fd.append('serviceDetails[extraImages]', file);
        else fd.append('serviceDetails[extraImagesPreviews][]', String(file));
      });

      // --- FRANCHISE ---
      const f = state.franchise;
      fd.append('franchiseDetails[commission]', f.commission ?? '');
      fd.append('franchiseDetails[commissionType]', f.commissionType ?? 'percentage');
      fd.append('franchiseDetails[termsAndConditions]', f.termsAndConditions ?? '');
      appendJson('franchiseDetails[investmentRange]', f.investmentRange);
      appendJson('franchiseDetails[monthlyEarnPotential]', f.monthlyEarnPotential);
      appendJson('franchiseDetails[franchiseModel]', f.franchiseModel);
      appendJson('franchiseDetails[extraSections]', f.extraSections);
      f.extraImages?.forEach((file: any) => {
        if (file instanceof File) fd.append('franchiseDetails[extraImages]', file);
        else fd.append('franchiseDetails[extraImagesPreviews][]', String(file));
      });

      // finally call updateService (your context function)
      const response = await updateService(service._id, fd);

      if (response?.success) {
        alert('Service updated successfully!');
        router.push('/service-management/service-list');
      } else {
        console.error('Update failed', response);
        alert('Update failed — check console for details.');
      }
    } catch (err) {
      console.error('Error updating service:', err);
      alert('An error occurred while updating. See console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const config = moduleFieldConfig[selectedModule] || {};
  const isFranchiseSelected = selectedModule === 'Franchise';

  return (
    <div className="no-scrollbar w-full max-w-full rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11 mx-auto mt-8">
      <ComponentCard title="Edit Service">
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

          {/* Franchise Stepper Header - Moved to top of BasicDetailsForm */}
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
        <div className="space-y-6">
          {isFranchiseSelected ? (
            franchiseStep === 1 ? (
              <>
                <BasicDetailsForm
                  data={{
                    serviceName: state.basic.serviceName,
                    category: state.basic.category,
                    subcategory: state.basic.subcategory,
                    price: state.basic.price,
                    discount: state.basic.discount,
                    includeGst: state.basic.includeGst,
                    gst: state.basic.gst,
                    recommendedServices: state.basic.recommendedServices,
                    discountedPrice: state.basic.discountedPrice,
                    thumbnailImage: state.basic.thumbnail,
                    bannerImages: state.basic.bannerImages,
                    tags: state.basic.tags,
                    keyValues: state.basic.keyValues,
                  }}
                  setData={(d) => onBasicSet(d)}
                  fieldsConfig={config.basicDetails}
                />
                <hr className="border-gray-300" />
                <ServiceDetailsForm
                  data={state.service as ServiceDetails}
                  setData={(d: any) => onServiceSet(d)}
                  fieldsConfig={config.serviceDetails}
                />
                <hr className="border-gray-300" />
                <FranchiseDetailsForm
                  data={state.franchise}
                  setData={(d: any) => onFranchiseSet(d)}
                  price={state.basic.discountedPrice}
                  fieldsConfig={config.franchiseDetails}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>

                  <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {isSubmitting ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </>
            ) : (

              <FranchiseExtraDetails serviceId={createdServiceId} onSave={() => setFranchiseStep(1)} />
            )
          ) : (
            <>
              <BasicDetailsForm
                data={{
                  serviceName: state.basic.serviceName,
                  category: state.basic.category,
                  subcategory: state.basic.subcategory,
                  price: state.basic.price,
                  discount: state.basic.discount,
                  includeGst: state.basic.includeGst,
                  gst: state.basic.gst,
                  recommendedServices: state.basic.recommendedServices,
                  discountedPrice: state.basic.discountedPrice,
                  thumbnailImage: state.basic.thumbnail,
                  bannerImages: state.basic.bannerImages,
                  tags: state.basic.tags,
                  keyValues: state.basic.keyValues,
                }}
                setData={(d) => onBasicSet(d)}
                fieldsConfig={config.basicDetails}
              />
              <hr className="border-gray-300" />
              <ServiceDetailsForm
                data={state.service as ServiceDetails}
                setData={(d: any) => onServiceSet(d)}
                fieldsConfig={config.serviceDetails}
              />
              <hr className="border-gray-300" />
              <FranchiseDetailsForm
                data={state.franchise}
                setData={(d: any) => onFranchiseSet(d)}
                price={state.basic.discountedPrice}
                fieldsConfig={config.franchiseDetails}
              />

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>

                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isSubmitting ? 'Updating...' : 'Update'}
                </button>
              </div>
            </>
          )}</div>
      </ComponentCard>
    </div>
  );
};

export default EditService;
